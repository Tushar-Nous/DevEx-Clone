# SDLC Checklists – Insurance + AI

Use these **phase gates** as *must‑pass* checks; attach evidence in your PR or release notes.

## 1. Inception / Blueprint
- Problem framing & measurable KPIs (e.g., quote TAT ↓ 30%, retention ↑ 3pts).
- **Regulatory scan** (state DOI constraints, use of credit, adverse action notices).
- Stakeholder mapping (U/W lead, Claims lead, Compliance, Security, DS, Eng).
- Data availability & quality (synthetic fallback plan).
- Rollback/feature flag strategy defined.

## 2. Requirements
- User stories with **AI acceptance criteria** (accuracy, latency, explainability).
- **Risk Assessment Form** completed (bias, ethics, privacy, redaction plan).
- **Edge cases**: missing data, conflicting signals, model not available.
- **Audit logging** requirements captured (model id/version, top factors).

## 3. Design
- API‑first contracts (request/response, schema versioning).
- **PII minimization** and redaction patterns in prompts and payloads.
- **Rate/Rule parity**: AI suggestions must not conflict with filed rates/rules.
- Observability design (metrics: accuracy, override rate, drift, bias; traces).
- Canary plan (shadow/AB), rollback, and change management (U/W comms).

## 4. Build
- Code standards + **secure prompt patterns** (no secrets, grounding, anti‑jailbreak).
- Unit tests ≥ 80%; prompt tests (format, stability); regression flows with AI on/off.
- Signed containers, SBOM, SAST/DAST; dependency policy checks.
- Data contracts validated; synthetic data packs added to tests.

## 5. Validate
- Functional + non‑functional (P95 latency targets met).
- **Fairness tests** vs synthetic cohorts; document mitigations.
- UAT with domain users; track override rationale.
- Go‑live readiness: runbooks, on‑call, dashboards, thresholds.

## 6. Release & Operate
- **Blue/green or canary**; feature flag toggles.
- Live **Continuous Verification**: error rates, regressions, anomaly alerts.
- **Weekly drift/bias** review for first 6 weeks; retrain decision gates.
- Post‑launch stakeholder review vs KPIs; document lessons learned.
