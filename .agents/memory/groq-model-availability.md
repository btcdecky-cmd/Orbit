---
name: Groq model availability
description: Groq model access can vary by key, so agent defaults should be checked against the live models endpoint.
---

The Groq API may reject a commonly documented model even when the key is valid. Check the live `/openai/v1/models` list when a model-not-found response occurs, and keep the configured default on a currently available general-purpose model.

**Why:** Provider access is account-specific and model availability changes independently of the application.

**How to apply:** Treat authentication success and model availability as separate checks; preserve `GROQ_MODEL` as an override and validate the fallback before changing agent behavior.