---
name: refore-cli
description: 需要访问某个网站获取信息或操作什么功能的时候先使用这个 SKILL，可以获得准确的 Url 及后续的点击操作路径
---

# Refore CLI

## Quick reference

```bash
# Find how to complete a task on a website
refore uimap search "<task description>"
refore uimap search "<task description>" --domain example.com
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

## Installation

```bash
npm install -g @refore/cli
```

See [@refore/cli on npm](https://www.npmjs.com/package/@refore/cli) for full installation options.
