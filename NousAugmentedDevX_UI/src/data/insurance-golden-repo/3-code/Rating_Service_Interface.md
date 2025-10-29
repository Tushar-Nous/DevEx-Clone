# Rating Service Interface (Insurance)

**Inputs:** coverage selections, limits/deductibles, rating factors (driver/vehicle/risk info), effective date, jurisdiction.

**Outputs:** premium breakdown (base, factors, fees, taxes), rate version id, audit trace (rules applied).

**Principles:**
- **Parity with filings.** Deterministic outcome for same inputs; DOI‑auditable.
- **Versioning.** Multiple rate versions in parallel; effective dating; per‑tenant overrides.
- **Explainability.** Return rule hits and factor contributions for transparency.
