# UIMap CLI

A command-line tool for [UIMap](https://uimap.ai). Manage API credentials, run MCP servers, and install agent skills.

## Features

- **Credential management** — Add, list, delete, and switch API credentials
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

### Add a credential

Get your API Key and App ID from the [UIMap API Key page](https://uimap.ai/user/api-key), then:

```bash
uimap credential add
```

You will be prompted for:

- **Server** — `China`, `World`, or a custom URL
- **API Key** — Your UIMap API key
- **App ID** — Your application ID

You can also set the credential by environment variables in your shell:

```bash
export UIMAP_SERVER=<China or World>
export UIMAP_API_KEY=<your_api_key>
export UIMAP_APP_ID=<your_app_id>
```

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
        "UIMAP_SERVER": "<China or World>",
        "UIMAP_API_KEY": "<your_api_key>",
        "UIMAP_APP_ID": "<your_app_id>"
      }
    }
  }
}
```

### Search for UI guides

```bash
uimap search "how to create a new project"
uimap search "how to invite a team member" --domain example.com
```

## Development And Testing For Local Agent

1. link uimap to global bin

```bash
pnpm link
uimap --version
```

2. add skills to local directory

```bash
uimap add-skill
```

By default skills are installed to `./.agents/skills`. Use `-o` to override:

```bash
uimap add-skill -o /path/to/skills
```

3. login

```bash
uimap login
UIMAP_ENABLE_CUSTOM_SERVER=true uimap login # if you want to use custom server url and oauth origin
```

4. test uimap in local agent tools

## License

[MIT](LICENSE) © Refore AI Team
