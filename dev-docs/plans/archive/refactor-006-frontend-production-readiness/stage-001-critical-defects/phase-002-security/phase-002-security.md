---
title: Security — XSS Mitigation
slug: phase-002-security
phase_number: 2
status: complete
owner: frontend
stage: stage-001-critical-defects
parts:
  - part-001-xss-mitigation
estimated_duration: 1d
---

## Goal

Eliminate the XSS attack surface in the AI chat markdown rendering pipeline by introducing DOMPurify as the final sanitisation gate before any string reaches `{@html}`.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [DOMPurify Integration](./part-001-xss-mitigation.md) | `draft` | frontend | 1d |

## Acceptance Criteria

- [ ] `DOMPurify.sanitize()` wraps every `{@html}` usage in the codebase.
- [ ] Unit tests assert that known XSS vectors (e.g., `<script>`, `onerror=`) are stripped from rendered output.
- [ ] All parts reach `complete` status.

## Notes

DOMPurify must be imported from `isomorphic-dompurify` or wrapped with a browser-environment guard to avoid SSR failures.
