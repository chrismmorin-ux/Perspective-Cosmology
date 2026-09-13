#!/usr/bin/env python3
"""
check_xrefs.py -- every internal path reference must resolve.

WHY THIS EXISTS. A document that cites a file which does not exist reads exactly
like one that cites a file which does. The reference looks authoritative, a
later session follows it, finds nothing, and either re-derives the content or
quietly treats the citation as satisfied. Nothing in the repository notices.

This is not hypothetical here. Two measurements, 2026-09-12:

  - This repository: 47 of 123 cited framework paths do not exist (38%). The
    canonical alpha-mechanism document declares its source to be a file that
    lives only under archive/deprecated/.

  - A sibling fleet repo built a mechanism to close exactly this class after
    finding an invariant "cited in 7 places across 4 files as if it existed --
    it had never been written." Three months later its own failure register
    acquired an entry citing a path that does not exist, and quoting four
    precise measured values from it. Nothing detected it.

THE BASELINE LEDGER. A repo with 38% pre-existing rot cannot adopt an
all-or-nothing gate: it would either block every commit or be switched off
within a day, and a gate that gets switched off is worse than none. So:

  - breakage recorded in the ledger  -> tracked debt, does not fail the build
  - breakage NOT in the ledger       -> FAIL, new rot cannot land
  - a ledger entry that now resolves -> FAIL, the ledger may shrink but not linger

The ledger is allowed to shrink and never to grow silently.

Usage:
    python tools/check_xrefs.py                 # check, honouring the ledger
    python tools/check_xrefs.py --strict        # ignore the ledger; all must resolve
    python tools/check_xrefs.py --write-baseline  # record current breakage as debt
    python tools/check_xrefs.py --self-test     # prove the checker can fail
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

LEDGER = "gates/xref-baseline.json"

TEXT_EXT = {".md", ".markdown"}
# A reference is only interesting if it points at something file-shaped.
REF_EXT = {".md", ".py", ".yaml", ".yml", ".json", ".lean", ".txt", ".csv",
           ".html", ".js", ".toml", ".cfg", ".ini", ".sh"}

# [label](target)
MD_LINK = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
# `some/path/like.this`
CODE_SPAN = re.compile(r"`([^`\n]+)`")

SKIP_PREFIX = ("http://", "https://", "mailto:", "#", "data:", "ftp://",
               "tel:", "//")


#: Characters that mean "this is a pattern, not a path". A template
#: (`.auditor/cache/CONFLICT_[id]_[date].md`), a glob (`verification/*.py`), or
#: a placeholder (`core/THM_<n>.md`) names a shape, not a file, and asserting it
#: must resolve is the checker being wrong rather than the repo.
PATTERN_CHARS = set("[]{}<>*?|")


def is_candidate(ref: str) -> bool:
    """A reference we are willing to assert must resolve.

    Deliberately conservative. An unresolvable reference is only a finding when
    we are confident it was meant to name a real file -- a noisy gate gets
    switched off, and a gate that is off is worse than no gate at all.
    """
    ref = ref.strip()
    if not ref or ref.startswith(SKIP_PREFIX):
        return False
    # Patterns and placeholders name a shape, not a file.
    if PATTERN_CHARS & set(ref):
        return False
    # A slash-command example ("/grade-investigation framework/x.md") or any
    # other prose containing a path is not itself a path.
    if " " in ref:
        return False
    # must look like a path into this repo
    if "/" not in ref and not ref.endswith(tuple(REF_EXT)):
        return False
    base = ref.split("#", 1)[0].split("?", 1)[0]
    ext = os.path.splitext(base)[1].lower()
    return ext in REF_EXT


#: Documents moved wholesale into quarantine/ were authored when the repository
#: root WAS their root, so a root-relative citation like `core/THM_0491.md` is
#: still correct relative to quarantine/. Resolving those only against the new
#: root would report ~1,550 breakages that the restructure invented and the
#: authors never wrote -- which would poison the ledger with defects nobody can
#: fix, and a ledger full of unfixable entries is one nobody reads.
RELOCATED_ROOTS = ("quarantine/",)


def resolve(ref: str, from_file: str, root: str) -> bool:
    """True if `ref`, cited inside `from_file`, names something that exists."""
    base = ref.strip().split("#", 1)[0].split("?", 1)[0]
    if not base:
        return True
    cands = []
    if base.startswith("/"):
        cands.append(os.path.join(root, base.lstrip("/")))
    else:
        cands.append(os.path.join(os.path.dirname(from_file), base))
        cands.append(os.path.join(root, base))
        rel = os.path.relpath(from_file, root).replace("\\", "/")
        for prefix in RELOCATED_ROOTS:
            if rel.startswith(prefix):
                cands.append(os.path.join(root, prefix, base))
    return any(os.path.exists(os.path.normpath(c)) for c in cands)


def tracked_text_files(root: str):
    """Prefer git's view; fall back to a walk so --self-test works anywhere."""
    try:
        out = subprocess.run(["git", "ls-files"], cwd=root, capture_output=True,
                             text=True, timeout=120)
        if out.returncode == 0 and out.stdout.strip():
            for line in out.stdout.splitlines():
                if os.path.splitext(line)[1].lower() in TEXT_EXT:
                    yield os.path.join(root, line)
            return
    except Exception:
        pass
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in {".git", ".lake", "node_modules"}]
        for fn in filenames:
            if os.path.splitext(fn)[1].lower() in TEXT_EXT:
                yield os.path.join(dirpath, fn)


def build_basename_index(root: str):
    """basename -> True for every file in the repo.

    Lets us split an unresolved reference into two very different defects.
    """
    idx = set()
    try:
        out = subprocess.run(["git", "ls-files"], cwd=root, capture_output=True,
                             text=True, timeout=120)
        if out.returncode == 0 and out.stdout.strip():
            for line in out.stdout.splitlines():
                idx.add(os.path.basename(line))
            return idx
    except Exception:
        pass
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in {".git", ".lake", "node_modules"}]
        idx.update(filenames)
    return idx


def scan(root: str):
    """Return (broken, total).

    `broken` entries are 'citing_file -> ref [CLASS]', where CLASS is:

      ABSENT   nothing by that name exists anywhere in the repo. The citation
               points at something that was never written, or was deleted. This
               is the dangerous class -- a reader cannot recover the target, and
               an AI session will either invent it or treat the citation as
               satisfied.

      MISPATH  the file exists, but not where the citation says. Usually a bare
               filename cited from another directory. Recoverable by search, but
               it still breaks any consumer that follows the path literally,
               and it silently rots further every time a file moves.

    Reporting these as one number overstates the damage. Separating them is the
    difference between "57% of this repo's citations are broken" and the truth.
    """
    names = build_basename_index(root)
    broken, total = [], 0
    for path in tracked_text_files(root):
        try:
            text = open(path, encoding="utf-8", errors="replace").read()
        except OSError:
            continue
        refs = set(MD_LINK.findall(text)) | set(CODE_SPAN.findall(text))
        rel_file = os.path.relpath(path, root).replace("\\", "/")
        for ref in refs:
            if not is_candidate(ref):
                continue
            total += 1
            if not resolve(ref, path, root):
                base = os.path.basename(ref.strip().split("#", 1)[0])
                cls = "MISPATH" if base in names else "ABSENT"
                broken.append(f"{rel_file} -> {ref.strip()} [{cls}]")
    return sorted(set(broken)), total


def load_ledger(root: str):
    p = os.path.join(root, LEDGER)
    if not os.path.exists(p):
        return None
    with open(p, encoding="utf-8") as fh:
        return set(json.load(fh).get("known_broken", []))


def main_check(root: str, strict: bool, write_baseline: bool) -> int:
    broken, total = scan(root)
    print(f"  scanned {total} internal references")
    print(f"  unresolved: {len(broken)}"
          + (f"  ({100.0 * len(broken) / total:.1f}%)" if total else ""))

    if write_baseline:
        p = os.path.join(root, LEDGER)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as fh:
            json.dump({
                "_comment": "Pre-existing unresolved references, recorded as "
                            "tracked debt. This list may shrink and must never "
                            "grow: a new entry means new rot landed.",
                "known_broken": broken,
            }, fh, indent=2)
        print(f"  wrote baseline: {len(broken)} entries -> {LEDGER}")
        return 0

    ledger = load_ledger(root)
    if strict or ledger is None:
        if ledger is None and not strict:
            print("  no baseline ledger; treating every reference as required")
        for b in broken[:40]:
            print(f"    BROKEN  {b}")
        if len(broken) > 40:
            print(f"    ... and {len(broken) - 40} more")
        return 1 if broken else 0

    new = sorted(set(broken) - ledger)
    healed = sorted(ledger - set(broken))
    print(f"  tracked debt: {len(ledger)}   new: {len(new)}   healed: {len(healed)}")
    for b in new:
        print(f"    NEW BROKEN  {b}")
    for h in healed:
        print(f"    HEALED (remove from ledger)  {h}")
    if new:
        print("\n  FAIL: new unresolved references landed.")
    if healed:
        print("\n  FAIL: ledger entries now resolve. Re-run --write-baseline;"
              " the ledger may shrink but must not linger.")
    return 1 if (new or healed) else 0


def self_test() -> int:
    """A gate that cannot prove it fails is not a gate."""
    print("SELF-TEST -- plant known conditions, assert the checker sees them.\n")
    tmp = tempfile.mkdtemp(prefix="xref_selftest_")
    fails = 0
    try:
        os.makedirs(os.path.join(tmp, "docs"), exist_ok=True)
        with open(os.path.join(tmp, "docs", "real.md"), "w", encoding="utf-8") as fh:
            fh.write("# real\n")

        # 1. positive control -- a reference that DOES resolve must not be flagged
        with open(os.path.join(tmp, "a.md"), "w", encoding="utf-8") as fh:
            fh.write("see [the doc](docs/real.md) and `docs/real.md`\n")
        broken, total = scan(tmp)
        ok = (total > 0 and not broken)
        fails += 0 if ok else 1
        print(f"  [{'PASS' if ok else 'FAIL'}] resolving reference not flagged "
              f"(saw {total} refs, {len(broken)} broken)")

        # 2. the instrument can actually go red
        with open(os.path.join(tmp, "b.md"), "w", encoding="utf-8") as fh:
            fh.write("see [gone](docs/does-not-exist.md)\n")
        broken, _ = scan(tmp)
        ok = any("does-not-exist.md" in b for b in broken)
        fails += 0 if ok else 1
        print(f"  [{'PASS' if ok else 'FAIL'}] broken link detected")

        # 3. backticked path form, which is how most of this repo cites
        with open(os.path.join(tmp, "c.md"), "w", encoding="utf-8") as fh:
            fh.write("as described in `framework/ghost.md`\n")
        broken, _ = scan(tmp)
        ok = any("ghost.md" in b for b in broken)
        fails += 0 if ok else 1
        print(f"  [{'PASS' if ok else 'FAIL'}] broken backticked path detected")

        # 4. external URLs are not our business
        with open(os.path.join(tmp, "d.md"), "w", encoding="utf-8") as fh:
            fh.write("[nist](https://physics.nist.gov/x.md) and [anchor](#section)\n")
        broken, _ = scan(tmp)
        ok = not any(("nist.gov" in b or "#section" in b) for b in broken)
        fails += 0 if ok else 1
        print(f"  [{'PASS' if ok else 'FAIL'}] URLs and anchors ignored")

        # 5. the ledger suppresses known debt but not new debt
        os.makedirs(os.path.join(tmp, os.path.dirname(LEDGER)), exist_ok=True)
        broken_now, _ = scan(tmp)
        with open(os.path.join(tmp, LEDGER), "w", encoding="utf-8") as fh:
            json.dump({"known_broken": broken_now}, fh)
        rc = main_check(tmp, strict=False, write_baseline=False)
        ok = (rc == 0)
        fails += 0 if ok else 1
        print(f"  [{'PASS' if ok else 'FAIL'}] fully-baselined repo passes")

        with open(os.path.join(tmp, "e.md"), "w", encoding="utf-8") as fh:
            fh.write("[fresh rot](docs/brand-new-gone.md)\n")
        rc = main_check(tmp, strict=False, write_baseline=False)
        ok = (rc == 1)
        fails += 0 if ok else 1
        print(f"  [{'PASS' if ok else 'FAIL'}] NEW breakage still fails despite ledger")

        # 6. a healed entry must also fail, so the ledger cannot linger
        os.remove(os.path.join(tmp, "e.md"))
        with open(os.path.join(tmp, "docs", "does-not-exist.md"), "w",
                  encoding="utf-8") as fh:
            fh.write("# now it exists\n")
        rc = main_check(tmp, strict=False, write_baseline=False)
        ok = (rc == 1)
        fails += 0 if ok else 1
        print(f"  [{'PASS' if ok else 'FAIL'}] healed ledger entry fails "
              f"(ledger may shrink, not linger)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    print(f"\n  {7 - fails}/7 checks behaved correctly.")
    return 1 if fails else 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.split("Usage:")[0],
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--strict", action="store_true",
                    help="ignore the ledger; every reference must resolve")
    ap.add_argument("--write-baseline", action="store_true",
                    help="record current breakage as tracked debt")
    ap.add_argument("--self-test", action="store_true",
                    help="prove the checker is capable of failing")
    ap.add_argument("--root", default=".")
    a = ap.parse_args()
    if a.self_test:
        sys.exit(self_test())
    sys.exit(main_check(os.path.abspath(a.root), a.strict, a.write_baseline))
