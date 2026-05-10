# Skill: OpenRouter AI Integration

**Description:** Provides expertise for integrating and interacting with the OpenRouter AI routing layer, which serves as the sole gateway for AI operations in the application.

**Capabilities:**

- Formulating stateless requests adhering to OpenRouter API schemas.
- Configuring model parameters (`temperature`, `max_tokens`, `top_p`, etc.) for specific creative or analytical tasks.
- Implementing structured outputs using JSON schemas (`response_format`).
- Handling provider fallbacks and multi-model routing.
- Processing SSE streams for real-time generative UI feedback.

**Usage:** Agents must use this skill when building or refactoring AI features (`src/modules/ai/`, `src/lib/ai/`) to ensure no direct provider APIs are used and that output generation remains structured and locally consumable.
---

### Implementation Standard: Structured Outputs

When requesting data payloads from OpenRouter models (e.g., consistency checks, outline generation), you must use the `response_format` parameter.

```json
{
  "model": "google/gemini-2.5-flash",
  "messages": [...],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "consistency_report",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "issues": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "severity": { "type": "string", "enum": ["low", "high"] },
                "description": { "type": "string" }
              },
              "required": ["severity", "description"],
              "additionalProperties": false
            }
          }
        },
        "required": ["issues"],
        "additionalProperties": false
      }
    }
  }
}
```
