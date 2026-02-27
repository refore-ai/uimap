# Refore CLI

A command-line tool for [Refore AI](https://reforeai.cn). Manage API credentials, convert web pages to AI-readable snapshots, run MCP servers, and install agent skills.

## Features

- **Credential management** — Add, list, delete, and switch API credentials
- **Web to AI** — Convert web page URLs to HTML snapshots for AI processing
- **MCP servers** — Provide MCP services for Refore AI CLI commands
- **Skills** — Install Refore CLI skills into your agent environment

## Installation

```bash
# npm (recommended)
npm install -g @refore/cli

# pnpm
pnpm add -g @refore/cli

# yarn
yarn global add @refore/cli
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

You can also set the credential by environment variables in your shell:

```bash
export REFORE_SERVER=<China or World>
export REFORE_API_KEY=<your_api_key>
export REFORE_APP_ID=<your_app_id>
```

### Install skills

Install Refore CLI skills into your agent skills directory (e.g. for Cursor):

```bash
refore add-skill
```

By default skills are installed to `./.agents/skills`. Use `-o` to override:

```bash
refore add-skill -o /path/to/skills
```

### MCP servers

```bash
npx @refore/cli mcp
```

Configure MCP server in your `mcp.json` file (for example in Cursor):

```json
{
  "mcpServers": {
    "refore-cli": {
      "command": "npx",
      "args": ["-y", "@refore/cli", "mcp"],
      "env": {
        "REFORE_SERVER": "<China or World>",
        "REFORE_API_KEY": "<your_api_key>",
        "REFORE_APP_ID": "<your_app_id>"
      }
    }
  }
}
```

## Publish

This project uses [Changesets](https://github.com/changesets/changesets).

```bash
pnpm changeset   # Add a changeset
pnpm version     # Apply version bumps
pnpm release     # Publish (with changesets)
```

## License

[MIT](LICENSE) © Refore AI Team
