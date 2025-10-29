# Audit Log Format (AI Decisions)

Fields (JSON):
- timestamp, tenant, user_id (or system), transaction_id
- model_name, model_version, prompt_template_id (if LLM)
- input_summary (no PII), output_summary, top_factors/reasons
- decision_used (y/n), override_flag, override_reason
- latency_ms, errors, trace_id
