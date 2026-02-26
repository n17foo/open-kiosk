# Contributing to OpenKiosk

Thank you for your interest in contributing! Here's how to get started.

## Getting Started

1. **Fork** the repository and clone locally.
2. Install dependencies: `npm install`
3. Start the dev server: `npm start`
4. Create a feature branch: `git checkout -b feat/your-feature`

## Development Workflow

1. Write code following the conventions in [AGENT.md](./AGENT.md).
2. Run linting: `npm run lint`
3. Run formatting: `npm run format`
4. Run tests: `npm test`
5. Commit with a descriptive message.
6. Push and open a Pull Request.

## Code Style

- TypeScript strict mode — no `any`.
- No `console.*` — use the logger.
- No barrel exports.
- Services must be singletons.
- Money arithmetic via `utils/money.ts` (integer cents).
- `isLoading` for boolean loading state.
- Named exports for hooks; default exports for components.

## Pull Requests

- Keep PRs focused and small.
- Include tests for new logic.
- Update documentation if adding new patterns.
- Ensure `npm run lint` and `npm test` pass.

## Reporting Issues

- Use GitHub Issues.
- Provide steps to reproduce.
- Include platform, OS version, and error logs.

## Code of Conduct

Be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
