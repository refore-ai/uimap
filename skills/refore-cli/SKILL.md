---
name: refore-cli
description: Use when you need to find step-by-step guides for completing tasks on websites (UIMap search), or convert web pages to AI-readable HTML snapshots (web-to-ai). Also handles Refore AI credential management (add, list, status, delete, set default, environment variables).
---

# Refore CLI

## Quick reference

```bash
# Find how to complete a task on a website
refore uimap search "<task description>"
refore uimap search "<task description>" --domain example.com

# Convert a web page to HTML snapshot
refore web-to-ai <url>

# Credential management
refore credential add
refore credential list
refore credential status
refore credential default
refore credential delete

# Use a specific credential
refore --credential "My Credential" <command>
```

## UIMap

Search for step-by-step operation guides to complete tasks on websites through browser automation. Use this when you need to know how to navigate or interact with a specific website.

- `--domain <domain>` — Restrict search to a specific domain

### Examples

```bash
refore uimap search "how to create a new project in example.com"
refore uimap search "how to invite a team member" --domain example.com
```

### Output

The command returns operation instructions for you to complete the task.

## web-to-ai

Convert a web page URL into an HTML snapshot for AI processing.

- `--width` — Viewport width in pixels (default: `1920`)
- `--height` — Viewport height in pixels (default: `1080`)
- `--theme` — Color theme: `light` or `dark` (default: `light`)
- `--locale` — Page locale, e.g. `en-US`, `zh-CN`
- `--output` — Output directory for the HTML file (default: `./`)

### Examples

```bash
refore web-to-ai https://example.com
refore web-to-ai https://example.com --width 1440 --height 900 --theme dark
refore web-to-ai https://example.com --locale zh-CN --output ./snapshots
```

## Credential management

Visit the [Refore AI API Key page](https://reforeai.cn/user/api-key) to obtain your API Key and App ID.

- `refore credential add` — Add a new credential (prompts: server [`China` / `World` / custom URL], API Key, App ID, then credential name)
- `refore credential status` — Show current credential details and confirm validity
- `refore credential list` — View all stored credentials
- `refore credential default` — Set the default credential
- `refore credential delete` — Delete one or more credentials

### Environment variables

When all three are set, they take precedence over any stored credential:

- `REFORE_SERVER` — Server region: `China`, `World`, or a custom URL
- `REFORE_API_KEY` — Your Refore API key
- `REFORE_APP_ID` — Your application ID

```bash
REFORE_SERVER=China REFORE_API_KEY=your-key REFORE_APP_ID=your-app-id refore web-to-ai https://example.com
```

## Installation

```bash
npm install -g @refore/cli
```

See [@refore/cli on npm](https://www.npmjs.com/package/@refore/cli) for full installation options.
