# UIMap CLI

A command-line tool for [UIMap](https://uimap.ai). Manage API credentials, run MCP servers, and install agent skills efficiently.

## Features

- **Authentication** — Log in to UIMap via browser OAuth seamlessly.
- **MCP Servers** — Run MCP services for UIMap CLI integration.
- **Skill Management** — Easily install UIMap CLI skills into your agent environment.

## Installation

```bash
# npm (recommended)
npm install -g @refore-ai/uimap

# pnpm
pnpm add -g @refore-ai/uimap

# yarn
yarn global add @refore-ai/uimap
```

## Quick Start

### Install UIMap Skill

#### Standard Usage

Use the following command to easily install the UIMap skill into various popular Agents:

```bash
npx skills add refore-ai/uimap
```

#### Advanced Usage

Install UIMap CLI skills into a specific agent skills directory (e.g., for Cursor):

```bash
uimap add-skill
```

By default, skills are installed to `./.agents/skills`. Use the `-o` flag to specify a custom output directory:

```bash
uimap add-skill -o /path/to/skills
```

### MCP Servers

To run the MCP server:

```bash
npx @refore-ai/uimap mcp
```

Configure the MCP server in your `mcp.json` file (e.g., for Cursor):

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

### CLI Usage in Terminal

You can also use the CLI directly in your terminal to search:

```bash
uimap search "how to create a new project"
uimap search "how to invite a team member" --domain example.com
```

## License

[MIT](LICENSE) © Refore AI Team
