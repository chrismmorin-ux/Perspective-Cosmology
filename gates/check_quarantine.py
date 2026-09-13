#!/usr/bin/env python3
"""
check_quarantine.py -- nothing outside quarantine/ may cite into it.

WHY. Quarantine that only relabels is theatre. The prior corpus is preserved
here for provenance and for the record of how it was built -- not so it can be
cited. A document outside quarantine that points into it is laundering
unadmitted material back into the live repo, and it does so invisibly: the
citation reads exactly like a citation to promoted content.

This is not hypothetical in this repository. Before the restructure, the
canonical alpha-mechanism document declared its source to be a file that lived
only under archive/deprecated/ -- a live document resting on material its own
author had retired. The gate exists so that cannot recur by accident.

THE RULE

    files under quarantine/   may cite anything
    files outside quarantine/ may cite quarantine/ only via the allowlist below

Promotion out of quarantine is a deliberate act: move the file, make it pass
the admissibility gates, and commit that. It is never "add a link and move on".

ALLOWLIST. Deliberately tiny, and every entry is navigational rather than
evidential -- a pointer saying "the old corpus is over there", never a claim
resting on its contents.

Usage:
    python gates/check_quarantine.py        # check
    python gates/check_quarantine.py --self-test
"""

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile

QUARANTINE = "quarantine/"

#: Files permitted to reference quarantine/, and only navigationally.
ALLOWLIST = {
    "README.md",
    "CLAUDE.md",
    "quarantine/README.md",
    "gates/check_quarantine.py",
    "gates/check_xrefs.py",
    "record/README.md",
}

TEXT_EXT = {".md", ".markdown"}
MD_LINK = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
CODE_SPAN = re.compile(r"`([^`\n]+)`")
SKIP_PREFIX = ("http://", "https://", "mailto:", "#", "data:")
PATTERN_CHARS = set("[]{}<>*?|")


def tracked_files(root):
    try:
        out = subprocess.run(["git", "ls-files"], cwd=root, capture_output=True,
                             text=True, timeout=120)
        if out.returncode == 0 and out.stdout.strip():
            return [l for l in out.stdout.splitlines()
                    if os.path.splitext(l)[1].lower() in TEXT_EXT]
    except Exception:
        pass
    found = []
    for dp, dn, fn in os.walk(root):
        dn[:] = [d for d in dn if d not in {".git", ".lake", "node_modules"}]
        for f in fn:
            if os.path.splitext(f)[1].lower() in TEXT_EXT:
                found.append(os.path.relpath(os.path.join(dp, f), root).replace("\\", "/"))
    return found


def cites_quarantine(ref, from_rel):
    """True if `ref`, written inside `from_rel`, points into quarantine/."""
    ref = ref.strip()
    if not ref or ref.startswith(SKIP_PREFIX) or (PATTERN_CHARS & set(ref)):
        return False
    if " " in ref:
        return False
    base = ref.split("#", 1)[0].split("?", 1)[0]
    if not base:
        return False
    # Resolve the reference every way a reader plausibly would, and flag it if
    # ANY of them lands in quarantine. A bare `quarantine/x.md` written in a
    # document is conventionally read as root-relative, not relative to the
    # citing file -- resolving only one way silently missed that whole form.
    candidates = []
    if base.startswith("/"):
        candidates.append(base.lstrip("/"))
    else:
        candidates.append(os.path.normpath(
            os.path.join(os.path.dirname(from_rel), base)).replace("\\", "/"))
        candidates.append(os.path.normpath(base).replace("\\", "/"))
    return any(c == QUARANTINE.rstrip("/") or c.startswith(QUARANTINE)
               for c in candidates)


def check(root):
    violations = []
    for rel in tracked_files(root):
        if rel.startswith(QUARANTINE) or rel in ALLOWLIST:
            continue
        try:
            text = open(os.path.join(root, rel), encoding="utf-8",
                        errors="replace").read()
        except OSError:
            continue
        for ref in set(MD_LINK.findall(text)) | set(CODE_SPAN.findall(text)):
            if cites_quarantine(ref, rel):
                violations.append(f"{rel} -> {ref.strip()}")
    violations = sorted(set(violations))
    print(f"  files checked outside quarantine: "
          f"{sum(1 for r in tracked_files(root) if not r.startswith(QUARANTINE))}")
    print(f"  citations into quarantine: {len(violations)}")
    for v in violations:
        print(f"    VIOLATION  {v}")
    if violations:
        print("\n  FAIL: live content is resting on unadmitted material.")
        print("  Promote the file properly, or drop the reference.")
    return 1 if violations else 0


def self_test():
    """A gate that cannot prove it fails is not a gate."""
    print("SELF-TEST -- plant known conditions, assert the gate sees them.\n")
    tmp = tempfile.mkdtemp(prefix="quar_selftest_")
    fails = 0
    try:
        os.makedirs(os.path.join(tmp, "quarantine", "framework"), exist_ok=True)
        os.makedirs(os.path.join(tmp, "record"), exist_ok=True)
        w = lambda p, s: open(os.path.join(tmp, p), "w", encoding="utf-8").write(s)
        w("quarantine/framework/old.md", "# old\n")
        w("record/clean.md", "stands alone, cites nothing quarantined\n")

        # 1. positive control -- a clean tree must pass
        rc = check(tmp)
        ok = rc == 0
        fails += 0 if ok else 1
        print(f"  [{'PASS' if ok else 'FAIL'}] clean tree passes\n")

        # 2. the gate can actually go red
        w("record/dirty.md", "see [the derivation](../quarantine/framework/old.md)\n")
        rc = check(tmp)
        ok = rc == 1
        fails += 0 if ok else 1
        print(f"  [{'PASS' if ok else 'FAIL'}] citation into quarantine detected\n")

        # 3. root-relative form is caught too
        os.remove(os.path.join(tmp, "record", "dirty.md"))
        w("record/dirty2.md", "as shown in `quarantine/framework/old.md`\n")
        rc = check(tmp)
        ok = rc == 1
        fails += 0 if ok else 1
        print(f"  [{'PASS' if ok else 'FAIL'}] root-relative citation detected\n")

        # 4. quarantine may cite itself freely
        os.remove(os.path.join(tmp, "record", "dirty2.md"))
        w("quarantine/framework/sibling.md",
          "internal ref to [old](old.md) is fine\n")
        rc = check(tmp)
        ok = rc == 0
        fails += 0 if ok else 1
        print(f"  [{'PASS' if ok else 'FAIL'}] quarantine may cite itself\n")

        # 5. the allowlist works, and is not a blanket exemption
        w("README.md", "the prior corpus lives in [quarantine](quarantine/README.md)\n")
        rc = check(tmp)
        ok = rc == 0
        fails += 0 if ok else 1
        print(f"  [{'PASS' if ok else 'FAIL'}] allowlisted file may point at quarantine\n")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print(f"  {5 - fails}/5 checks behaved correctly.")
    return 1 if fails else 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.split("Usage:")[0],
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--root", default=".")
    a = ap.parse_args()
    sys.exit(self_test() if a.self_test else check(os.path.abspath(a.root)))
