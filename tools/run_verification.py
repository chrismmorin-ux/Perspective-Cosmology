#!/usr/bin/env python3
"""
Verification Script Runner for Perspective Cosmology

Runs all verification scripts in verification/sympy/ and produces a clean
report of pass/fail status.

KEY DESIGN: Only counts [PASS] and [FAIL] markers (with square brackets)
as test assertions. Bare "FAIL" in descriptive text is ignored.

Usage:
    python tools/run_verification.py              # Full run, 8 workers
    python tools/run_verification.py --workers 4  # Custom parallelism
    python tools/run_verification.py --timeout 30 # Custom timeout (seconds)
    python tools/run_verification.py --failed     # Re-run only previously failed
    python tools/run_verification.py --json       # JSON output for CI
    python tools/run_verification.py --summary    # One-line summary only
"""

import argparse
import json
import os
import subprocess
import sys
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class ScriptResult:
    name: str
    pass_count: int = 0
    fail_count: int = 0
    fail_lines: list = field(default_factory=list)
    exit_code: int = 0
    error: str = ""
    timed_out: bool = False
    duration_ms: int = 0
    has_tests: bool = False


def run_single_script(args: tuple) -> ScriptResult:
    """Run a single verification script and parse its output."""
    script_path, timeout_sec, python_exe = args
    name = os.path.basename(script_path)
    result = ScriptResult(name=name)

    start = time.monotonic()
    try:
        proc = subprocess.run(
            [python_exe, script_path],
            capture_output=True,
            text=True,
            timeout=timeout_sec,
            encoding="utf-8",
            errors="replace",
            cwd=os.path.dirname(script_path),
        )
        result.exit_code = proc.returncode
        output = proc.stdout + proc.stderr

        # Count ONLY bracketed [PASS] and [FAIL] markers
        for line in output.split("\n"):
            stripped = line.strip()
            if "[PASS]" in stripped:
                result.pass_count += stripped.count("[PASS]")
            if "[FAIL]" in stripped:
                count = stripped.count("[FAIL]")
                result.fail_count += count
                result.fail_lines.append(stripped[:200])

        result.has_tests = (result.pass_count + result.fail_count) > 0

        # Capture stderr for error scripts
        if proc.returncode != 0 and not result.has_tests:
            stderr_lines = proc.stderr.strip().split("\n")
            result.error = stderr_lines[-1][:200] if stderr_lines else "unknown error"

    except subprocess.TimeoutExpired:
        result.timed_out = True
        result.error = f"Timed out after {timeout_sec}s"
    except Exception as e:
        result.error = str(e)[:200]
        result.exit_code = -1

    result.duration_ms = int((time.monotonic() - start) * 1000)
    return result


def main():
    parser = argparse.ArgumentParser(description="Run verification scripts")
    parser.add_argument("--workers", type=int, default=8,
                        help="Number of parallel workers (default: 8)")
    parser.add_argument("--timeout", type=int, default=20,
                        help="Per-script timeout in seconds (default: 20)")
    parser.add_argument("--failed", action="store_true",
                        help="Re-run only scripts that failed last time")
    parser.add_argument("--json", action="store_true",
                        help="Output JSON instead of text")
    parser.add_argument("--summary", action="store_true",
                        help="One-line summary only")
    parser.add_argument("--verbose", action="store_true",
                        help="Show each script result as it completes")
    args = parser.parse_args()

    # Find repo root (parent of tools/)
    repo_root = Path(__file__).resolve().parent.parent
    scripts_dir = repo_root / "verification" / "sympy"

    if not scripts_dir.exists():
        print(f"ERROR: {scripts_dir} not found", file=sys.stderr)
        sys.exit(1)

    # Collect scripts
    scripts = sorted(scripts_dir.glob("*.py"))
    if not scripts:
        print("ERROR: No .py files found", file=sys.stderr)
        sys.exit(1)

    # Filter to previously failed if requested
    last_failed_path = repo_root / "tools" / ".last_failed.json"
    if args.failed and last_failed_path.exists():
        with open(last_failed_path) as f:
            failed_names = set(json.load(f))
        scripts = [s for s in scripts if s.name in failed_names]
        if not scripts:
            print("No previously failed scripts to re-run.")
            return

    python_exe = sys.executable
    total = len(scripts)
    task_args = [(str(s), args.timeout, python_exe) for s in scripts]

    if not args.json and not args.summary:
        print(f"Running {total} scripts with {args.workers} workers, "
              f"{args.timeout}s timeout...")
        print()

    # Run in parallel
    start_time = time.monotonic()
    results: list[ScriptResult] = []

    with ProcessPoolExecutor(max_workers=args.workers) as executor:
        futures = {executor.submit(run_single_script, a): a[0] for a in task_args}
        done_count = 0
        for future in as_completed(futures):
            result = future.result()
            results.append(result)
            done_count += 1

            if args.verbose and not args.json:
                status = "PASS" if result.fail_count == 0 and not result.timed_out and result.exit_code == 0 else "FAIL"
                print(f"[{done_count}/{total}] {status} {result.name} "
                      f"({result.pass_count}P/{result.fail_count}F, {result.duration_ms}ms)")

    elapsed = time.monotonic() - start_time
    results.sort(key=lambda r: r.name)

    # Classify results
    all_pass = []       # Has tests, all [PASS], no [FAIL]
    has_fail = []       # Has [FAIL] markers
    no_tests = []       # No [PASS] or [FAIL] markers (informational scripts)
    errors = []         # Non-zero exit code without test markers
    timeouts = []       # Timed out

    for r in results:
        if r.timed_out:
            timeouts.append(r)
        elif r.has_tests and r.fail_count == 0:
            all_pass.append(r)
        elif r.fail_count > 0:
            has_fail.append(r)
        elif r.exit_code != 0:
            errors.append(r)
        else:
            no_tests.append(r)

    # Save failed list for --failed reruns
    failed_names = [r.name for r in has_fail + errors + timeouts]
    last_failed_path.parent.mkdir(parents=True, exist_ok=True)
    with open(last_failed_path, "w") as f:
        json.dump(failed_names, f)

    # Output
    if args.json:
        output = {
            "total": total,
            "all_pass": len(all_pass),
            "has_fail": len(has_fail),
            "no_tests": len(no_tests),
            "errors": len(errors),
            "timeouts": len(timeouts),
            "total_pass_assertions": sum(r.pass_count for r in results),
            "total_fail_assertions": sum(r.fail_count for r in results),
            "elapsed_seconds": round(elapsed, 1),
            "failed_scripts": [
                {"name": r.name, "fail_count": r.fail_count,
                 "fail_lines": r.fail_lines}
                for r in has_fail
            ],
            "error_scripts": [
                {"name": r.name, "error": r.error}
                for r in errors
            ],
            "timeout_scripts": [r.name for r in timeouts],
        }
        print(json.dumps(output, indent=2))
        return

    total_pass_assertions = sum(r.pass_count for r in results)
    total_fail_assertions = sum(r.fail_count for r in results)
    pass_rate = len(all_pass) / max(1, total - len(no_tests)) * 100

    if args.summary:
        print(f"{total} scripts | {len(all_pass)} PASS | {len(has_fail)} FAIL | "
              f"{len(no_tests)} no-tests | {len(errors)} errors | {len(timeouts)} timeouts | "
              f"{total_pass_assertions} assertions | {elapsed:.0f}s | "
              f"{pass_rate:.1f}% pass rate")
        return

    # Full report
    print("=" * 70)
    print(f"VERIFICATION REPORT")
    print(f"=" * 70)
    print(f"Total scripts:     {total}")
    print(f"All [PASS]:        {len(all_pass)}")
    print(f"Has [FAIL]:        {len(has_fail)}")
    print(f"No test markers:   {len(no_tests)}")
    print(f"Errors:            {len(errors)}")
    print(f"Timeouts:          {len(timeouts)}")
    print(f"Total assertions:  {total_pass_assertions} PASS, {total_fail_assertions} FAIL")
    print(f"Pass rate:         {pass_rate:.1f}% (of scripts with tests)")
    print(f"Elapsed:           {elapsed:.1f}s ({args.workers} workers)")
    print()

    if has_fail:
        print("-" * 70)
        print(f"FAILED SCRIPTS ({len(has_fail)}):")
        print("-" * 70)
        for r in has_fail:
            print(f"\n  {r.name} ({r.pass_count} PASS, {r.fail_count} FAIL)")
            for line in r.fail_lines:
                print(f"    {line}")

    if errors:
        print()
        print("-" * 70)
        print(f"ERROR SCRIPTS ({len(errors)}):")
        print("-" * 70)
        for r in errors:
            print(f"  {r.name}: {r.error}")

    if timeouts:
        print()
        print("-" * 70)
        print(f"TIMED OUT ({len(timeouts)}):")
        print("-" * 70)
        for r in timeouts:
            print(f"  {r.name}")

    print()
    print("=" * 70)


if __name__ == "__main__":
    main()
