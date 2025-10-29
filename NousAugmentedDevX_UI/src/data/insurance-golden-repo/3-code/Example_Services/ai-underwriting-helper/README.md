# AI Underwriting Helper (Service)

**Endpoint:** `POST /underwriting/signals`
- **Input:** submission JSON (normalized PAS schema)
- **Process:** enrich (hazard, MVR); model inference for risk signals; produce reasons + data refs
- **Output:** `{ decision, reasons[], data_refs[], model_version }`

**SLOs:** P95 ≤ 800ms; 99.9% availability; error < 0.1%

**Controls:** feature flag; full audit logs; parity checks on weekly schedule.
