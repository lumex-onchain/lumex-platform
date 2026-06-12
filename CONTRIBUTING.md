# Contributing to lumex-platform

Thanks for contributing to Lumex! This guide covers the backend services repository.

## Wave Programme

Issues labeled `wave:high`, `wave:medium`, `wave:trivial`, and `good-first-issue` are eligible for Stellar Wave Programme bounties. Find them on the [issues page](https://github.com/lumex-onchain/lumex-platform/issues).

## Development Setup

1. Clone the repo: `git clone https://github.com/lumex-onchain/lumex-platform.git`
2. Configure GitHub Packages auth (see README for `.npmrc` setup)
3. `npm install`
4. Copy `infra/docker/.env.example` to `infra/docker/.env` and fill in values
5. `docker compose -f infra/docker/docker-compose.yml up -d`

## Pull Request Workflow

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes with tests
4. Run `npm run lint && npm run type-check && npm test`
5. Push and open a PR against `main`
6. Reference any related issues in the PR description

## Multi-Repository Issues

If your change touches both this repo and another (e.g., `lumex-sdk`), open PRs in each repo and cross-reference them.

## Code Style

- TypeScript strict mode
- ESLint + Prettier enforced in CI
- Tests required for new handlers/routes

## Questions

Open a discussion or issue on GitHub.
