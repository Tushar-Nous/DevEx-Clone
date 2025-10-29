# Smart Underwriting (AI‑Assisted Risk Signals)

**What:** AI suggests risk signals during quote intake (e.g., hazard flags, data gaps, referral triggers) and provides **reason codes**.

**Flow (High‑level):**
1. Agent captures submission → PAS normalizes data.
2. AI service enriches with third‑party (e.g., hazard, MVR, credit where allowed).
3. Model outputs signals (e.g., *High prior losses*, *Inconsistent payroll*).
4. Underwriter reviews + overrides with rationale stored.

**Quality & Controls:**
- **Targets:** P95 latency ≤ 800ms; signal precision ≥ 0.8.
- **Explainability:** top‑K features; attach links to evidence/snippets.
- **Fairness:** no use of prohibited attributes; monitor parity deltas.
- **Audit:** log model ver, input summary, outputs, overrides.
- **Fail‑safe:** if AI down, continue baseline rules; mark as “no‑AI”.
