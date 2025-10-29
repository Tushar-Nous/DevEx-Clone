# Secure AI Patterns

- **Prompt Hygiene:** No secrets/keys. No PII/PHI. Strip directives like “ignore instructions”.
- **Redaction:** Tokenize SSN/CC; mask names; minimize context sent externally.
- **Network:** Private egress; mTLS; allowlist endpoints; rotate keys.
- **Storage:** Encrypt prompts/outputs at rest; short retention; access logs.
- **Abuse:** Rate limits; anomaly detection; jailbreak filters; content moderation.
