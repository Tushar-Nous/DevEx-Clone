# Policy Document Summarizer (LLM)

**What:** Convert policy forms/endorsements into **plain‑language** summaries with **traceable citations** back to source text.

**Controls:**
- Redact PII before LLM calls; chunk + cache.
- Ground responses to document spans; include citations.
- Human review for customer‑facing outputs; store diffs and feedback.
- Benchmark: factuality ≥ 95% on sampled audits; zero PII leakage.
