---
title: Add Regression Tests for JSON Encoding
slug: part-002-add-regression-tests
part_number: 2
status: review
owner: Planner Agent
phase: phase-003-db-repair-and-tests
target_file: tests/db/json-encoding.test.ts
---

## Task

Create comprehensive regression tests (`tests/db/json-encoding.test.ts`) that validate:

1. POST → GET round-trips return arrays (not strings)
2. Type guards work correctly for string/array inputs
3. Server hardening (Phase 2) tolerates pre-stringified values
4. `encodeJson` / `decodeJson` edge cases

## Test Coverage

### 1. Round-Trip POST → GET Tests

```ts
describe('JSON Encoding Round-Trip', () => {
    it('POST character with tags as array → GET returns array', async () => {
        // POST with tags: ['tag1', 'tag2']
        // GET the created character
        // Assert: character.tags is Array, not string
    });
    
    it('POST location with characterIds as array → GET returns array', async () => {
        // Similar pattern for locations and all JSON fields
    });
});
```

### 2. Type Guard Tests

```ts
describe('joinCommaSeparated Type Guard', () => {
    it('returns empty string for string input', () => {
        expect(joinCommaSeparated('["tag"]')).toBe('');
    });
    
    it('returns empty string for undefined', () => {
        expect(joinCommaSeparated(undefined)).toBe('');
    });
    
    it('joins array correctly', () => {
        expect(joinCommaSeparated(['a', 'b'])).toBe('a, b');
    });
});
```

### 3. Pre-Stringified Value Tolerance (Phase 3 Validation)

```ts
describe('Server Hardening - Pre-Stringified Values', () => {
    it('POST with pre-stringified tags → GET returns proper array', async () => {
        // POST with body: { tags: JSON.stringify(['tag1']) }
        // GET the created entity
        // Assert: tags is an array, not a string
    });
});
```

### 4. Serialization Edge Cases

```ts
describe('encodeJson / decodeJson', () => {
    it('handles null input', () => {
        expect(decodeJson(null)).toEqual([]);
    });
    
    it('handles empty array', () => {
        expect(decodeJson('[]')).toEqual([]);
    });
    
    it('handles double-encoded value', () => {
        // Input: '"[]"' (a string containing JSON)
        // This test documents the behavior if such data exists
    });
});
```

## Acceptance Criteria

- [ ] Test file created at `tests/db/json-encoding.test.ts`
- [ ] Minimum 8+ test cases covering the above scenarios
- [ ] All tests passing: `pnpm test tests/db/json-encoding.test.ts`
- [ ] Full test suite passing: `pnpm test`
- [ ] No lint or type errors
- [ ] Tests validate all phases (1, 2, 3) working together
- [ ] Part marked `complete`

## Notes

- Tests use Vitest (existing test framework)
- Mock or use test database as appropriate
- Tests should be fast and independent
- Clear test names document expected behavior
- Tests serve as regression prevention for future changes
