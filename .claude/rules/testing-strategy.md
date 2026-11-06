# Testing Strategy

## Universal Rules
- **At minimum: one test per critical path.** Payment processing, user authentication, and data mutations must have tests. No exceptions.
- **Test the behavior, not the implementation.** "When a user submits valid payment details, the order is created" not "mock.assert_called_with(...)".
- **Tests must be deterministic.** No test should depend on time, random values, or external services. Use fixtures, factories, and mocks for external dependencies.
- **Failed tests block commits.** If a test fails, fix it before committing. Never skip or disable tests to make a commit pass.
- **Test names describe the scenario.** `test_payment_with_expired_card_returns_error` not `test_payment_3`.
- **A killed worker is an infrastructure failure, not a test result.** `node down`, `Not properly terminated`, or exit 137 in the runner output means a worker ran out of memory. Set container memory limits and test parallelism together, and treat either crash signal as a red build.
- **Persistent test databases must key on the schema they were built from.** A reused test DB from another branch's migrations produces hundreds of phantom failures on a clean branch; rebuild it when the migration head changes.

## What to Test First (Priority Order)
1. **Money and payments** — any code that charges users or allocates funds
2. **Authentication and authorization** — login, permissions, data isolation
3. **Data mutations** — creates, updates, deletes that affect user data
4. **Business rules** — domain-specific logic that encodes requirements
5. **Edge cases** — zero amounts, empty inputs, boundary values

## What NOT to Test
- Framework boilerplate (Django's ORM, React's rendering)
- Configuration files
- Third-party library internals
- Trivial getters/setters

## Stack-Specific

### Python (pytest)
- Use `pytest` with fixtures and factories (not `unittest.TestCase`)
- Use `pytest-xdist` for parallel test execution
- Target 80%+ coverage on business logic (don't chase 100% everywhere)

### JavaScript (Jest/Vitest)
- Use `describe`/`it` blocks for clear test organization
- Use React Testing Library for component tests (test user behavior, not component internals)
- Mock API calls with MSW or similar
