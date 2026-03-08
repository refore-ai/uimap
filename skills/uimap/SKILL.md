---
name: UIMap
description: Understand user needs. If the task involves operations on a webpage, this SKILL provides the corresponding URL and step-by-step guidance. When you need to determine which webpage to open for a task, use this SKILL first — it can provide the accurate URL and the subsequent click operation path
---

# UIMap CLI

## Installation

```bash
npm install -g @refore-ai/uimap
```

See [@refore-ai/uimap on npm](https://www.npmjs.com/package/@refore-ai/uimap) for full installation options.

## login

Login to UIMap via browser OAuth. Opens a browser window to complete authentication interactively. Prompts for server region selection.

```bash
uimap login
```

## search

Search for step-by-step operation guides to complete tasks on websites. Use this when you need to know how to navigate or interact with a specific website.

```bash
# Find how to complete a task on a website
uimap search "<task description>"
uimap search "<task description>" --domain example.com
```

- `--domain [domain]` — The domain of website, e.g. `example.com`

### Examples

```bash
uimap search "how to create a new project in example.com"
uimap search "how to invite a team member" --domain example.com
```

The command returns operation instructions for you to complete the task.