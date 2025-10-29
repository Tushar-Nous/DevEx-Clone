# Insurance Golden Repo – Overview

**Purpose.** The Insurance Golden Repo (IGR) is the single source of truth for an **AI‑enabled SDLC** in the insurance domain. 
It codifies *how* we build, test, govern, deploy, and monitor AI features for policy administration, billing, and claims—**responsibly** and **at speed**.

**Guiding Principles**
- **Cloud‑agnostic, API‑first, event‑driven.** Decouple business capabilities and integration layers.
- **Multi‑tenant ready.** Logical isolation by tenant; shared services with strict data boundaries.
- **Responsible AI by design.** Govern models (fairness, transparency, oversight), log decisions, enable rollbacks.
- **Automation everywhere.** IaC, CI/CD, MLOps, test automation, AI‑assisted engineering.
- **Observability.** Metrics, logs, traces for both app and models; clear SLOs and error budgets.

**Structure**
- `0-docs/` – Guidance (governance, SDLC checklists, glossary, architecture reference).
- `1-requirements/` – AI use‑case definition templates, risk forms, sample insurance AI use cases.
- `2-data/` – Governance, synthetic datasets by LOB, validation scripts, bias checks.
- `3-code/` – Integration SDK, prompt templates, example services, secure AI patterns.
- `4-testing/` – Unit, prompt, regression, bias tests; CI/CD integration.
- `5-deployment/` – MLOps, model cards, monitoring, rollback playbooks.
- `6-compliance/` – ISO27001 mapping, NAIC guidance, audit log formats, responsible AI metrics.

> Use this repo to **bootstrap** any new insurance AI feature and to **evidence compliance** during audits.
