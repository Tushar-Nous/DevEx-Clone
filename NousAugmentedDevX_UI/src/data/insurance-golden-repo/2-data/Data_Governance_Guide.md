# Data Governance Guide (Insurance)

**PII/PHI Principles**
- Minimize, anonymize, tokenize. Keep prompts free of identifiers.
- Encrypt at rest/in transit. Rotate keys. Zero secrets in code.
- Retain only as long as required (policy lifecycle + statutory).

**Lineage & Quality**
- Track dataset provenance and transformations.
- Required fields, code sets (ISO, NAICS, NCCI), ranges validation.
- Golden sources for master data; reconciliation and DQ alerts.

**Third‑Party Data**
- Contractual rights to use for AI; scope and storage limits.
- Accuracy disclaimers; handling disputes; periodic refresh cadence.
