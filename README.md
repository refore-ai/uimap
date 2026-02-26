# Refore CLI

A command-line tool for [Refore AI](https://reforeai.cn). Manage API credentials, convert web pages to AI-readable snapshots, run MCP servers, and install agent skills.

## Features

- **Credential management** — Add, list, remove, and switch API credentials
- **Web to AI** — Convert web page URLs to HTML snapshots for AI processing
- **MCP servers** — Provide MCP services for Refore AI CLI commands
- **Skills** — Install Refore CLI skills into your agent environment

## Installation

### Global install

```bash
# npm (recommended)
npm install -g @refore/cli

# pnpm
pnpm add -g @refore/cli

# yarn
yarn global add @refore/cli
```

### Run without installing

```bash
npx @refore/cli --help
```

## Quick start

### Add a credential

Get your API Key and App ID from the [Refore AI API Key page](https://reforeai.cn/user/api-key), then:

```bash
refore credential add
```

You will be prompted for:

- **Server** — `China`, `World`, or a custom URL
- **API Key** — Your Refore API key
- **App ID** — Your application ID

### Install skills

Install Refore CLI skills into your agent skills directory (e.g. for Cursor):

```bash
refore add-skill
```

By default skills are installed to `./.agents/skills`. Use `-o` to override:

```bash
refore add-skill -o /path/to/skills
```

### Start MCP servers

```bash
refore refore-mcp
refore uimap-mcp
```

You can explore more commands by running `refore --help`.

## Publish

This project uses [Changesets](https://github.com/changesets/changesets).

```bash
pnpm changeset   # Add a changeset
pnpm version     # Apply version bumps
pnpm release     # Publish (with changesets)
```

## License

[MIT](LICENSE) © Refore AI Team
