# AI Governance (Insurance Context)

**Objective.** Ensure AI improves outcomes **without** violating regulatory expectations (NAIC principles), privacy, or fairness mandates.

## Roles & Operating Model
- **AI Governance Board** (Underwriting, Claims, Product, Compliance, Security, Data Science, Engineering):
  - Approves new AI use cases, model deployments, and model updates.
  - Reviews fairness metrics, override rates, incident reports.
- **Model Owner** – accountable for business outcome, KPIs, fairness thresholds.
- **Model Steward (MLOps)** – owns model lifecycle, monitoring, drift & bias checks, rollback.
- **Responsible AI SPOC** – coordinates privacy/ethics reviews and content standards for prompts.

## Policy Guardrails
- **Fairness & Non‑discrimination.** Define protected/regulated attributes; prohibit direct usage; monitor proxies.
- **Transparency.** Maintain **Model Cards**, decision logs (model version, salient factors, confidence).
- **Explainability.** Provide human‑interpretable reasons (e.g., rule hits, top features) for risk‑impacting outputs.
- **Human‑in‑the‑loop.** Underwriters/adjusters retain final authority on risk/payout decisions.
- **Data Minimization.** Strict PII/PHI minimization; redact prompts; aggregate where possible.
- **Security.** Secrets isolation, signed artifacts, encrypted channels, least privilege.
- **Lifecycle.** Approval gates for train/validate/deploy; scheduled revalidation; sunset criteria.

## Lifecycle Controls (Evidence to keep)
- **Use‑case Dossier:** business intent, benefit/risk, legal review, target KPIs.
- **Training Data Sheet:** lineage, timeframe, exclusions, consent handling, balancing.
- **Validation Report:** accuracy, stability, stress, **fairness metrics**, sensitivity.
- **Production Logs:** input summary, output, model version, overrides, latency, errors.
- **Periodics:** drift/bias reports, audit trails, retraining decisions, rollback history.
