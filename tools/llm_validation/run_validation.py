#!/usr/bin/env python3
"""
LLM Derivation Challenge Runner

This script runs the LLM Derivation Challenge against external LLMs to test
whether independent models can derive n_d=4, n_c=11, and 137 from the axioms alone.

Usage:
    python run_validation.py --mode manual    # Generate prompts for copy-paste
    python run_validation.py --mode api       # Run via API (requires keys)
    python run_validation.py --analyze        # Analyze existing results
    python run_validation.py --report         # Generate summary report

Author: Framework validation system
Created: Session 132
"""

import argparse
import json
import os
import sys
import re
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple

# Project paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
AXIOM_FILE = PROJECT_ROOT / "framework" / "axioms_for_llm_challenge.md"
RESULTS_FILE = PROJECT_ROOT / "registry" / "llm_challenge_results.md"
CONFIG_FILE = SCRIPT_DIR / "config.json"
RAW_RESULTS_DIR = SCRIPT_DIR / "raw_results"

# Expected answers (for evaluation only)
EXPECTED = {
    "n_d": 4,
    "n_c": 11,
    "pythagorean": 137,  # n_d^2 + n_c^2
    "product": 44,       # n_d * n_c
    "sum": 15,           # n_d + n_c
}

# ============================================================================
# PROMPT GENERATION
# ============================================================================

SYSTEM_PROMPT = """You are a mathematician working on an abstract algebraic framework.

You have been given a set of axioms about vector spaces and projections.
Your task is to determine what specific numbers emerge from these axioms.

IMPORTANT RULES:
- Work purely from the mathematics presented
- Do not look up any physics constants or values
- Do not assume any specific numbers in advance
- Show your derivation step by step
- State all theorems you use and why they apply
- If multiple values are possible, explain what constrains them
- If you get stuck, explain where and why

This is a pure mathematics exercise with no intended physical interpretation."""


def load_axiom_document() -> str:
    """Load the axiom document for the challenge."""
    if not AXIOM_FILE.exists():
        raise FileNotFoundError(f"Axiom file not found: {AXIOM_FILE}")
    return AXIOM_FILE.read_text(encoding="utf-8")


def generate_user_prompt() -> str:
    """Generate the full user prompt with axioms embedded."""
    axioms = load_axiom_document()

    return f"""Please analyze the following mathematical framework and answer the questions at the end.

---

{axioms}

---

Please derive:

1. The maximum dimension of the accessible subspace (n_d), given that time evolution requires associativity in the transition algebra

2. The dimension of the hidden/crystal subspace (n_c), derived from the imaginary parts of the permitted division algebras

3. Any dimensionless integers or ratios that emerge from n_d and n_c (such as sums, products, or Pythagorean combinations)

Show your complete mathematical reasoning. What theorems do you invoke? What are the key steps?"""


def generate_manual_prompt(model_name: str = "GPT-4") -> str:
    """Generate a complete prompt ready for copy-paste."""
    user_prompt = generate_user_prompt()

    output = f"""
{'='*80}
LLM DERIVATION CHALLENGE - {model_name.upper()}
{'='*80}

Generated: {datetime.now().isoformat()}

INSTRUCTIONS:
1. Open a FRESH {model_name} session (no prior context)
2. Copy the SYSTEM PROMPT below (if the interface supports it)
3. Copy the USER PROMPT into the chat
4. Send and wait for complete response
5. DO NOT give hints or corrections
6. Record the raw response

{'='*80}
SYSTEM PROMPT (copy if interface supports system prompts)
{'='*80}

{SYSTEM_PROMPT}

{'='*80}
USER PROMPT (copy this into the chat)
{'='*80}

{user_prompt}

{'='*80}
END OF PROMPTS
{'='*80}

After receiving the response:
1. Save the COMPLETE response to tools/llm_validation/raw_results/
2. Run: python run_validation.py --analyze
"""
    return output


# ============================================================================
# API INTEGRATION (Optional - requires API keys)
# ============================================================================

def load_config() -> Dict[str, Any]:
    """Load API configuration."""
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text())
    return {}


def run_openai_challenge() -> Optional[str]:
    """Run challenge via OpenAI API."""
    try:
        import openai
    except ImportError:
        print("OpenAI package not installed. Run: pip install openai")
        return None

    config = load_config()
    api_key = config.get("openai_api_key") or os.environ.get("OPENAI_API_KEY")

    if not api_key:
        print("No OpenAI API key found. Set OPENAI_API_KEY or add to config.json")
        return None

    client = openai.OpenAI(api_key=api_key)

    print("Running challenge via OpenAI API...")
    print("Model: gpt-4-turbo-preview")

    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": generate_user_prompt()}
        ],
        temperature=0.3,  # Lower for more deterministic reasoning
        max_tokens=4000
    )

    return response.choices[0].message.content


def run_anthropic_challenge() -> Optional[str]:
    """Run challenge via Anthropic API (separate Claude instance)."""
    try:
        import anthropic
    except ImportError:
        print("Anthropic package not installed. Run: pip install anthropic")
        return None

    config = load_config()
    api_key = config.get("anthropic_api_key") or os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        print("No Anthropic API key found. Set ANTHROPIC_API_KEY or add to config.json")
        return None

    client = anthropic.Anthropic(api_key=api_key)

    print("Running challenge via Anthropic API...")
    print("Model: claude-3-opus-20240229")

    response = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=4000,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": generate_user_prompt()}
        ]
    )

    return response.content[0].text


def run_google_challenge() -> Optional[str]:
    """Run challenge via Google Gemini API."""
    try:
        import google.generativeai as genai
    except ImportError:
        print("Google Generative AI package not installed. Run: pip install google-generativeai")
        return None

    config = load_config()
    api_key = config.get("google_api_key") or os.environ.get("GOOGLE_API_KEY")

    if not api_key:
        print("No Google API key found. Set GOOGLE_API_KEY or add to config.json")
        return None

    genai.configure(api_key=api_key)

    print("Running challenge via Google Gemini API...")
    print("Model: gemini-pro")

    model = genai.GenerativeModel(
        model_name="gemini-pro",
        system_instruction=SYSTEM_PROMPT
    )

    response = model.generate_content(generate_user_prompt())
    return response.text


# ============================================================================
# RESULT ANALYSIS
# ============================================================================

def extract_numbers(text: str) -> Dict[str, Any]:
    """Extract key numbers from LLM response."""
    results = {
        "n_d_found": None,
        "n_c_found": None,
        "pythagorean_found": None,
        "product_found": None,
        "sum_found": None,
        "frobenius_mentioned": False,
        "hurwitz_mentioned": False,
        "division_algebras_mentioned": False,
        "quaternions_mentioned": False,
        "octonions_mentioned": False,
    }

    text_lower = text.lower()

    # Check for theorem mentions
    results["frobenius_mentioned"] = "frobenius" in text_lower
    results["hurwitz_mentioned"] = "hurwitz" in text_lower
    results["division_algebras_mentioned"] = "division algebra" in text_lower
    results["quaternions_mentioned"] = "quaternion" in text_lower
    results["octonions_mentioned"] = "octonion" in text_lower

    # Look for n_d values
    nd_patterns = [
        r"n_d\s*=\s*(\d+)",
        r"n_d is (\d+)",
        r"accessible.*dimension.*=?\s*(\d+)",
        r"maximum.*dimension.*=?\s*(\d+)",
        r"quaternions.*dimension.*4",
    ]
    for pattern in nd_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                results["n_d_found"] = int(match.group(1))
                break
            except (ValueError, IndexError):
                pass

    # Special case: if quaternions mentioned with 4, likely n_d=4
    if results["n_d_found"] is None and results["quaternions_mentioned"]:
        if re.search(r"quaternion.*4|4.*dimension.*quaternion", text_lower):
            results["n_d_found"] = 4

    # Look for n_c values
    nc_patterns = [
        r"n_c\s*=\s*(\d+)",
        r"n_c is (\d+)",
        r"hidden.*dimension.*=?\s*(\d+)",
        r"crystal.*dimension.*=?\s*(\d+)",
        r"imaginary.*parts.*=?\s*(\d+)",
        r"1\s*\+\s*3\s*\+\s*7\s*=\s*11",
        r"Im.*total.*=?\s*11",
    ]
    for pattern in nc_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                if "11" in match.group(0):
                    results["n_c_found"] = 11
                else:
                    results["n_c_found"] = int(match.group(1))
                break
            except (ValueError, IndexError):
                pass

    # Check for 1+3+7=11 pattern
    if results["n_c_found"] is None:
        if re.search(r"1\s*\+\s*3\s*\+\s*7", text):
            results["n_c_found"] = 11

    # Look for Pythagorean combinations
    pythagorean_patterns = [
        r"4\^?2?\s*\+\s*11\^?2?\s*=\s*137",
        r"16\s*\+\s*121\s*=\s*137",
        r"n_d\^?2?\s*\+\s*n_c\^?2?\s*=\s*137",
        r"pythagorean.*=?\s*137",
        r"=\s*137\b",
    ]
    for pattern in pythagorean_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            results["pythagorean_found"] = 137
            break

    # Look for product
    if re.search(r"4\s*[×x\*]\s*11\s*=\s*44|n_d\s*[×x\*]\s*n_c\s*=\s*44|product.*=?\s*44", text, re.IGNORECASE):
        results["product_found"] = 44

    # Look for sum
    if re.search(r"4\s*\+\s*11\s*=\s*15|n_d\s*\+\s*n_c\s*=\s*15|sum.*=?\s*15", text, re.IGNORECASE):
        results["sum_found"] = 15

    return results


def evaluate_response(text: str) -> Dict[str, Any]:
    """Evaluate an LLM response against expected values."""
    extracted = extract_numbers(text)

    evaluation = {
        "extracted": extracted,
        "n_d_correct": extracted["n_d_found"] == EXPECTED["n_d"],
        "n_c_correct": extracted["n_c_found"] == EXPECTED["n_c"],
        "pythagorean_correct": extracted["pythagorean_found"] == EXPECTED["pythagorean"],
        "used_frobenius": extracted["frobenius_mentioned"],
        "used_division_algebras": extracted["division_algebras_mentioned"],
    }

    # Determine outcome
    correct_count = sum([
        evaluation["n_d_correct"],
        evaluation["n_c_correct"],
        evaluation["pythagorean_correct"]
    ])

    if correct_count == 3:
        evaluation["outcome"] = "FULL_SUCCESS"
    elif correct_count > 0:
        evaluation["outcome"] = "PARTIAL_SUCCESS"
    elif extracted["frobenius_mentioned"] or extracted["division_algebras_mentioned"]:
        evaluation["outcome"] = "INTERESTING_FAILURE"
    else:
        evaluation["outcome"] = "UNINFORMATIVE"

    evaluation["correct_count"] = correct_count
    evaluation["reasoning_quality"] = (
        "EXCELLENT" if extracted["frobenius_mentioned"] and extracted["hurwitz_mentioned"]
        else "GOOD" if extracted["frobenius_mentioned"] or extracted["division_algebras_mentioned"]
        else "FAIR" if extracted["quaternions_mentioned"]
        else "POOR"
    )

    return evaluation


def format_evaluation_report(model: str, response: str, evaluation: Dict) -> str:
    """Format evaluation as markdown for results file."""
    timestamp = datetime.now().isoformat()
    extracted = evaluation["extracted"]

    report = f"""
## Test: {model}

**Date**: {timestamp}
**Model**: {model}
**Session**: Fresh (no prior context)

### Extracted Values

| Quantity | Found | Expected | Correct |
|----------|-------|----------|---------|
| n_d | {extracted['n_d_found'] or 'NOT FOUND'} | {EXPECTED['n_d']} | {'YES' if evaluation['n_d_correct'] else 'NO'} |
| n_c | {extracted['n_c_found'] or 'NOT FOUND'} | {EXPECTED['n_c']} | {'YES' if evaluation['n_c_correct'] else 'NO'} |
| n_d^2+n_c^2 | {extracted['pythagorean_found'] or 'NOT FOUND'} | {EXPECTED['pythagorean']} | {'YES' if evaluation['pythagorean_correct'] else 'NO'} |

### Reasoning Analysis

- **Frobenius theorem cited**: {'YES' if extracted['frobenius_mentioned'] else 'NO'}
- **Hurwitz theorem cited**: {'YES' if extracted['hurwitz_mentioned'] else 'NO'}
- **Division algebras discussed**: {'YES' if extracted['division_algebras_mentioned'] else 'NO'}
- **Quaternions mentioned**: {'YES' if extracted['quaternions_mentioned'] else 'NO'}
- **Octonions mentioned**: {'YES' if extracted['octonions_mentioned'] else 'NO'}

### Outcome

**Result**: {evaluation['outcome']}
**Correct Values**: {evaluation['correct_count']}/3
**Reasoning Quality**: {evaluation['reasoning_quality']}

### Response (Verbatim)

<details>
<summary>Click to expand full response</summary>

{response}

</details>

---
"""
    return report


# ============================================================================
# RAW RESULT MANAGEMENT
# ============================================================================

def save_raw_result(model: str, response: str) -> Path:
    """Save raw result to file."""
    RAW_RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{model.lower().replace(' ', '_')}_{timestamp}.txt"
    filepath = RAW_RESULTS_DIR / filename

    content = f"""MODEL: {model}
DATE: {datetime.now().isoformat()}
STATUS: RAW (not yet analyzed)

{'='*80}
RESPONSE
{'='*80}

{response}
"""
    filepath.write_text(content, encoding="utf-8")
    print(f"Saved raw result to: {filepath}")
    return filepath


def load_raw_results() -> List[Tuple[str, str, str]]:
    """Load all raw results from the raw_results directory."""
    if not RAW_RESULTS_DIR.exists():
        return []

    results = []
    for filepath in RAW_RESULTS_DIR.glob("*.txt"):
        content = filepath.read_text(encoding="utf-8")

        # Parse model name
        model_match = re.search(r"MODEL:\s*(.+)", content)
        model = model_match.group(1).strip() if model_match else filepath.stem

        # Extract response
        response_match = re.search(r"RESPONSE\n=+\n\n(.+)", content, re.DOTALL)
        response = response_match.group(1).strip() if response_match else content

        results.append((filepath.name, model, response))

    return results


def analyze_all_results() -> str:
    """Analyze all raw results and generate summary."""
    results = load_raw_results()

    if not results:
        return "No raw results found. Run validation first or add results to tools/llm_validation/raw_results/"

    summary = ["# LLM Derivation Challenge - Analysis Summary\n"]
    summary.append(f"**Generated**: {datetime.now().isoformat()}\n")
    summary.append(f"**Total Tests**: {len(results)}\n\n")

    outcomes = {"FULL_SUCCESS": 0, "PARTIAL_SUCCESS": 0, "INTERESTING_FAILURE": 0, "UNINFORMATIVE": 0}

    for filename, model, response in results:
        evaluation = evaluate_response(response)
        outcomes[evaluation["outcome"]] += 1

        report = format_evaluation_report(model, response, evaluation)
        summary.append(report)

    # Add summary statistics
    total = len(results)
    summary.insert(3, f"""
## Summary Statistics

| Outcome | Count | Percentage |
|---------|-------|------------|
| FULL SUCCESS | {outcomes['FULL_SUCCESS']} | {100*outcomes['FULL_SUCCESS']/total:.1f}% |
| PARTIAL SUCCESS | {outcomes['PARTIAL_SUCCESS']} | {100*outcomes['PARTIAL_SUCCESS']/total:.1f}% |
| INTERESTING FAILURE | {outcomes['INTERESTING_FAILURE']} | {100*outcomes['INTERESTING_FAILURE']/total:.1f}% |
| UNINFORMATIVE | {outcomes['UNINFORMATIVE']} | {100*outcomes['UNINFORMATIVE']/total:.1f}% |

---
""")

    return "".join(summary)


# ============================================================================
# MAIN CLI
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="LLM Derivation Challenge Runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --mode manual              Generate prompts for copy-paste (default)
  %(prog)s --mode manual --model gpt  Generate GPT-specific prompt
  %(prog)s --mode api --provider openai   Run via OpenAI API
  %(prog)s --analyze                  Analyze all raw results
  %(prog)s --report                   Generate summary report
  %(prog)s --interactive              Interactive mode with menus
"""
    )

    parser.add_argument(
        "--mode",
        choices=["manual", "api"],
        default="manual",
        help="Run mode: manual (copy-paste) or api (requires keys)"
    )

    parser.add_argument(
        "--model",
        default="GPT-4",
        help="Model name for prompt generation (manual mode)"
    )

    parser.add_argument(
        "--provider",
        choices=["openai", "anthropic", "google"],
        help="API provider (api mode)"
    )

    parser.add_argument(
        "--analyze",
        action="store_true",
        help="Analyze existing raw results"
    )

    parser.add_argument(
        "--report",
        action="store_true",
        help="Generate summary report and update results file"
    )

    parser.add_argument(
        "--interactive",
        action="store_true",
        help="Interactive menu mode"
    )

    args = parser.parse_args()

    # Handle special modes
    if args.analyze:
        summary = analyze_all_results()
        print(summary)
        return

    if args.report:
        summary = analyze_all_results()
        # Update results file
        RESULTS_FILE.parent.mkdir(parents=True, exist_ok=True)

        # Preserve existing content with new analysis
        existing = ""
        if RESULTS_FILE.exists():
            existing = RESULTS_FILE.read_text(encoding="utf-8")

        # Append new analysis
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        new_content = f"{existing}\n\n---\n\n# Automated Analysis ({timestamp})\n\n{summary}"
        RESULTS_FILE.write_text(new_content, encoding="utf-8")
        print(f"Updated: {RESULTS_FILE}")
        return

    if args.interactive:
        interactive_mode()
        return

    # Standard modes
    if args.mode == "manual":
        prompt = generate_manual_prompt(args.model)
        print(prompt)

        # Also save to file for easy access
        output_file = SCRIPT_DIR / f"prompt_{args.model.lower().replace(' ', '_')}.txt"
        output_file.write_text(prompt, encoding="utf-8")
        print(f"\nPrompt also saved to: {output_file}")

    elif args.mode == "api":
        if not args.provider:
            print("Error: --provider required for api mode")
            sys.exit(1)

        response = None
        if args.provider == "openai":
            response = run_openai_challenge()
        elif args.provider == "anthropic":
            response = run_anthropic_challenge()
        elif args.provider == "google":
            response = run_google_challenge()

        if response:
            print("\n" + "="*80)
            print("RESPONSE RECEIVED")
            print("="*80 + "\n")
            print(response)

            # Save raw result
            save_raw_result(f"{args.provider}-api", response)

            # Evaluate
            evaluation = evaluate_response(response)
            print("\n" + "="*80)
            print("EVALUATION")
            print("="*80 + "\n")
            print(f"Outcome: {evaluation['outcome']}")
            print(f"Correct values: {evaluation['correct_count']}/3")
            print(f"n_d: {evaluation['extracted']['n_d_found']} (expected: {EXPECTED['n_d']}) - {'CORRECT' if evaluation['n_d_correct'] else 'WRONG'}")
            print(f"n_c: {evaluation['extracted']['n_c_found']} (expected: {EXPECTED['n_c']}) - {'CORRECT' if evaluation['n_c_correct'] else 'WRONG'}")
            print(f"137: {evaluation['extracted']['pythagorean_found']} (expected: {EXPECTED['pythagorean']}) - {'CORRECT' if evaluation['pythagorean_correct'] else 'WRONG'}")


def interactive_mode():
    """Interactive menu for running validations."""
    while True:
        print("\n" + "="*60)
        print("LLM DERIVATION CHALLENGE - Interactive Mode")
        print("="*60)
        print("\n1. Generate prompt for manual testing")
        print("2. Run via OpenAI API")
        print("3. Run via Anthropic API")
        print("4. Run via Google Gemini API")
        print("5. Record manual test result")
        print("6. Analyze all results")
        print("7. Generate report")
        print("8. Exit")

        choice = input("\nChoice: ").strip()

        if choice == "1":
            model = input("Model name (e.g., GPT-4, Claude, Gemini): ").strip() or "GPT-4"
            prompt = generate_manual_prompt(model)
            print(prompt)

            save = input("\nSave to file? (y/n): ").strip().lower()
            if save == "y":
                output_file = SCRIPT_DIR / f"prompt_{model.lower().replace(' ', '_')}.txt"
                output_file.write_text(prompt, encoding="utf-8")
                print(f"Saved to: {output_file}")

        elif choice == "2":
            response = run_openai_challenge()
            if response:
                print("\nResponse received.")
                save_raw_result("openai-gpt4", response)

        elif choice == "3":
            response = run_anthropic_challenge()
            if response:
                print("\nResponse received.")
                save_raw_result("anthropic-claude", response)

        elif choice == "4":
            response = run_google_challenge()
            if response:
                print("\nResponse received.")
                save_raw_result("google-gemini", response)

        elif choice == "5":
            model = input("Model name: ").strip()
            print("Paste the LLM response (end with a line containing only 'END'):")
            lines = []
            while True:
                line = input()
                if line.strip() == "END":
                    break
                lines.append(line)
            response = "\n".join(lines)
            save_raw_result(model, response)

            # Evaluate
            evaluation = evaluate_response(response)
            print(f"\nOutcome: {evaluation['outcome']}")
            print(f"Correct: {evaluation['correct_count']}/3")

        elif choice == "6":
            summary = analyze_all_results()
            print(summary)

        elif choice == "7":
            summary = analyze_all_results()
            RESULTS_FILE.parent.mkdir(parents=True, exist_ok=True)

            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
            new_section = f"\n\n---\n\n# Automated Analysis ({timestamp})\n\n{summary}"

            if RESULTS_FILE.exists():
                existing = RESULTS_FILE.read_text(encoding="utf-8")
                RESULTS_FILE.write_text(existing + new_section, encoding="utf-8")
            else:
                RESULTS_FILE.write_text(f"# LLM Derivation Challenge Results\n{new_section}", encoding="utf-8")

            print(f"Report saved to: {RESULTS_FILE}")

        elif choice == "8":
            print("Goodbye!")
            break

        else:
            print("Invalid choice")


if __name__ == "__main__":
    main()
