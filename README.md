# UIMap CLI

A command-line tool for [UIMap](https://uimap.ai). Manage API credentials, run MCP servers, and install agent skills.

## Features

- **Login** — Login to UIMap via browser OAuth. Opens a browser window to complete authentication interactively
- **MCP servers** — Provide MCP services for UIMap CLI commands
- **Skills** — Install UIMap CLI skills into your agent environment

## Installation

```bash
# npm (recommended)
npm install -g @refore-ai/uimap

# pnpm
pnpm add -g @refore-ai/uimap

# yarn
yarn global add @refore-ai/uimap
```

## Quick start

### Install skills

Install UIMap CLI skills into your agent skills directory (e.g. for Cursor):

```bash
uimap add-skill
```

By default skills are installed to `./.agents/skills`. Use `-o` to override:

```bash
uimap add-skill -o /path/to/skills
```

### MCP servers

```bash
npx @refore-ai/uimap mcp
```

Configure MCP server in your `mcp.json` file (for example in Cursor):

```json
{
  "mcpServers": {
    "uimap": {
      "command": "npx",
      "args": ["-y", "@refore-ai/uimap", "mcp"],
      "env": {
        "UIMAP_API_KEY": "<your_api_key>",
        "UIMAP_APP_ID": "<your_app_id>"
      }
    }
  }
}
```

### Search UIMap

```bash
uimap search "how to create a new project"
uimap search "how to invite a team member" --domain example.com
```

## License

[MIT](LICENSE) © Refore AI Team
