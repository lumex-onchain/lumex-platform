# lumex-platform

[![Wave Programme](https://img.shields.io/badge/Stellar-Wave%20Programme-blue)](https://drips.network/wave/stellar/repos)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Open-source middleware bridge connecting Stellar Anchor Platform to MetaTrader 4/5.

## Overview

Backend services for the Lumex bridge, handling KYC/AML (SEP-12), FX quotes (SEP-38), deposits, withdrawals, and MT4 integration.

## Packages

| Package | Description |
|---------|-------------|
| `anchor-business-server` | SEP-12 KYC and SEP-38 quote endpoints |
| `bridge-core` | Deposit/withdrawal handlers and MT4 integration |
| `shared` | Common TypeScript types and utilities (published as `@lumex/shared`) |
| `compliance-sdk` | Internal AML/KYC utilities (Chainalysis, Onfido, Sumsub) |
| `corridor-configs` | Fiat currency corridor configurations (NGN, KES, GHS, ZAR, BRL) |

## Tech Stack

Node.js 20, TypeScript, Express, PostgreSQL, Redis

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- GitHub personal access token (for `@lumex/shared` from GitHub Packages)

## GitHub Packages Authentication

This repo consumes `@lumex/shared` from GitHub Packages. Create a `.npmrc` in the root:

```
@lumex:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Generate a token at GitHub → Settings → Developer settings → Personal access tokens with `read:packages` scope.

## Getting Started

```bash
git clone https://github.com/lumex-onchain/lumex-platform.git
cd lumex-platform
cp infra/docker/.env.example infra/docker/.env
npm install
docker compose -f infra/docker/docker-compose.yml up -d
```

## Versioning

This repository uses [semantic versioning](https://semver.org/) (MAJOR.MINOR.PATCH). Releases are tagged `vMAJOR.MINOR.PATCH`. See [CHANGELOG.md](CHANGELOG.md) for release history.

## Related Repositories

Part of the [lumex-onchain](https://github.com/lumex-onchain) organization:

- [lumex-platform](https://github.com/lumex-onchain/lumex-platform) — Backend services (this repo)
- [lumex-contracts](https://github.com/lumex-onchain/lumex-contracts) — Soroban smart contracts
- [lumex-dashboard](https://github.com/lumex-onchain/lumex-dashboard) — React frontend
- [lumex-sdk](https://github.com/lumex-onchain/lumex-sdk) — TypeScript client SDK

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues tagged `wave:high`, `wave:medium`, `wave:trivial`, and `good-first-issue` are part of the Stellar Wave Programme bounty system.

## License

MIT © 2026 Lumex Contributors
