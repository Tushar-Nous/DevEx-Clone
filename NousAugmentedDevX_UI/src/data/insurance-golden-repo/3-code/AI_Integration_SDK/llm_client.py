# Minimal redaction-aware LLM client (stub)
import re, time

class LLMResponse:
    def __init__(self, text, citations=None, tokens=0, latency_ms=0):
        self.text = text
        self.citations = citations or []
        self.tokens = tokens
        self.latency_ms = latency_ms

class LLMClient:
    PII_PATTERN = re.compile(r"""(\b\d{3}-\d{2}-\d{4}\b|\b\d{16}\b)""")  # SSN / CC simplistic example

    def __init__(self, model="gpt-4o", redact=True):
        self.model = model
        self.redact = redact

    def _redact(self, text:str) -> str:
        return self.PII_PATTERN.sub("[REDACTED]", text)

    def complete(self, prompt:str, context:str=None):
        t0 = time.time()
        if self.redact and context:
            context = self._redact(context)
        # Stubbed completion
        output = f"[{self.model}] Summary: " + (context[:200] + "..." if context else prompt[:200])
        latency = int((time.time() - t0) * 1000)
        return LLMResponse(text=output, citations=[], tokens=len(output)//4, latency_ms=latency)
