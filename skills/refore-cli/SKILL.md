---
name: refore
description: Refore AI CLI tool. Use for installing the CLI, managing API credentials (add, list, remove, set default), converting web pages to AI-readable HTML snapshots, or working with UIMap MCP server.
---

# Refore CLI

## Which guide to read

Pick the document that matches the user's intent and read it before proceeding:

| Intent                                                                    | Document                         |
| ------------------------------------------------------------------------- | -------------------------------- |
| Install the Refore CLI, verify installation, check version                | [install.md](./install.md)       |
| Credentials: add / list / remove / switch default, or get an Access Token | [credential.md](./credential.md) |
| Convert a web page URL to an HTML snapshot for AI processing              | [web-to-ai.md](./web-to-ai.md)   |
| UIMap operations                                                          | [uimap.md](./uimap.md)           |

## Quick reference

```bash
# Install
npm install -g @refore/cli

# Credential management
refore credential add
refore credential list

# Convert a web page
refore web-to-ai <url>

# Use a specific credential
refore --credential "My Credential" <command>
```
