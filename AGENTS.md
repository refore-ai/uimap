# UIMap CLI — Agent Guidelines

## Project Overview

UIMap CLI is a command-line tool for [UIMap](https://uimap.ai). It provides authentication via OAuth, MCP server functionality, and skill management for agent environments.

- **Package**: `@refore-ai/uimap`
- **Entry**: `dist/cli.mjs`
- **Node Version**: >= 20.0.0
- **Package Manager**: pnpm

## Language Policy

**English Only** — All content in this project MUST be in English:

- Source code comments
- Commit messages
- Documentation (README, docs, inline docs)
- Variable and function names
- Error messages and logs
- Configuration files
- Test descriptions

## Development Commands

```bash
# Development
pnpm dev                 # Run CLI in dev mode with custom server
pnpm build               # Build with tsdown
pnpm typecheck           # TypeScript check
pnpm lint                # ESLint check

# Release
pnpm release             # Full release (release-it + CDN)
pnpm release:cdn         # Upload to CDN only
```

## Coding Standards

- **Framework**: TypeScript with ES modules
- **Linting**: ESLint with @antfu/config + Prettier
- **Commits**: Conventional commits enforced by commitlint
- **Type Safety**: Strict TypeScript, no implicit any

## Key Constraints

- `chore` commit type cannot be used for files in `src/` directory
- Node.js 20+ required
- CDN release requires `./scripts/release-cdn.sh`
