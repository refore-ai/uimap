---
name: update-uimap-skill
description: Update the skills/uimap documentation templates to match the latest CLI source code. Use when CLI commands, options, or behavior have changed and the bundled skill docs need to be synced.
metadata:
  internal: true
---

# Update UIMap Skill Docs

When this skill is invoked, read the CLI source code and update `skills/uimap/SKILL.md` to accurately reflect the current commands, options, and behavior. Do the full update in one pass — read everything first, then write.

## Step 1: Read source files

Read these files in parallel:

- `src/cli.ts` — global options and registered commands
- `src/commands/uimap.ts` — arguments and options
- `src/lib/api.ts` — `createCurrentCredentialAPI()` to identify environment variable support
- `package.json` — package name for install command

Do not document `mcp` or `add-skill` — they are infrastructure commands, not end-user features.

## Step 2: Read current skill doc

Read `skills/uimap/SKILL.md` to see what is currently documented.

## Step 3: Update `skills/uimap/SKILL.md`

All documentation lives in a single file. Rewrite only what is missing, inaccurate, or outdated. Derive all command names, option names, default values, environment variable names, and interactive prompt details from the source — do not invent or assume them.

### File structure (keep this order)

1. **YAML frontmatter** — `name: UIMap`（保持此大小写）; update `description` to reflect actual user-facing use cases, leading with the most commonly used features
2. **Installation** — minimal: one install command + external link; comes right after the H1 heading
3. **Feature sections** — document only `login` and `search`; `login` comes before `search`; omit `credential`, global options, and environment variables

### Format conventions

**Options**: use list format, not tables:
```
- `--flag` — description (default: `value`)
- `--flag` — description, e.g. `example`   ← for options without defaults
```

**Commands list** (e.g. subcommands): use list format, not tables:
```
- `command subcommand` — description including any interactive prompt details
```

**Environment variables**: use list format, not tables.

**Section depth**: H2 = feature, H3 = subgroup within a feature. No deeper.

**Code blocks**: use ` ```bash ` language tag.

**Output format samples**: do not include — backend output format may change independently.

## Step 4: Sanity check

Re-read `skills/uimap/SKILL.md` and confirm:
1. `login` and `search` commands are present and accurately described
2. No doc entries reference commands or options removed from source
3. All option names and default values for `login` and `search` match the source exactly
