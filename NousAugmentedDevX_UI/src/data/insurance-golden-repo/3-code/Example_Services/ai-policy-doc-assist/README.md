# AI Policy Document Assist (Service)

**Endpoint:** `POST /docs/summarize`
- **Input:** policy/endorsement text (PII‑redacted)
- **Output:** bullet list of changes + citations to sections

**Controls:** cache by document hash; redact prior to LLM; human review for customer outputs.
