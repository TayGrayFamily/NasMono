# Testing Strategy for `game-server`

We use **Vitest** for testing and **supertest** for API integration testing.

## Running Tests

To run all tests in the `game-server` package, execute:

```bash
pnpm test
```

from the `packages/game-server` directory.

## Testing Pattern

1.  **Isolation**: For tests that interact with external services (like PostgreSQL), use mocks to ensure tests are fast, deterministic, and can be run without a live database.
2.  **Integration**: Use `supertest` to test API endpoints. Ensure that `createApp()` is used to instantiate the application, which allows for graceful cleanup using `afterAll`.
3.  **Persistence**: For tests that _do_ require a database, prefer using a transactional approach or a clean test database environment defined in `vitest.config.ts`.
4.  **New Features**: All new features and patterns, unless explicitly marked as temporary, should be accompanied by tests that assert their core behavior.

## Example (API Test)

See `packages/game-server/src/api.test.ts` for an example of how to test Express routes using `supertest` and module mocking.
