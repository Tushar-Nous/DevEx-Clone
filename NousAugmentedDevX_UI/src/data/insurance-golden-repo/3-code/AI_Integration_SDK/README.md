# AI Integration SDK

**Purpose.** Provide a single, secure abstraction for calling AI services and external data (e.g., LLMs, risk scoring, ISO/Verisk).

## Features
- **Redaction‑aware client** – auto‑masks PII before prompt/model calls.
- **Policy & telemetry** – logs model id/version, latency, token use, errors.
- **Circuit breakers** – graceful fallback to rules if model is unavailable.
- **Adapters** – plug‑in clients for LLM, vector search, ISO/Verisk risk APIs.

## Example
```python
from ai_integration_sdk.llm_client import LLMClient

client = LLMClient(model="gpt-4o", redact=True)
resp = client.complete("Summarize this endorsement:", context=document_text)
print(resp.text, resp.citations)
```
