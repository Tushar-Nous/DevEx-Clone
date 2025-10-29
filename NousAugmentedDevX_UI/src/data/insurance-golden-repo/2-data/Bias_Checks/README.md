# Bias Checks (Method & Thresholds)

**Approach**
- Define cohorts (e.g., geography bands, business size); avoid illegal attributes.
- Evaluate parity (approval rates, error rates, benefit allocation).
- Investigate proxies (ZIP → socio‑economic). Apply constraints/regularization.

**Thresholds (example)**
- Disparate Impact Ratio ≥ 0.8 (warning < 0.9).
- Parity difference (TPR/FPR) ≤ 5pp across cohorts.
- Override asymmetry ≤ 10pp between cohorts.

**Process**
- Pre‑launch fairness report → Governance Board sign‑off.
- Continuous monitoring; investigate drift → retrain or recalibrate.
