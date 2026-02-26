# UIMap

Search for operation guides to complete tasks on websites.

## Prerequisites

Refore credentials must be configured. See [credential.md](./credential.md).

## CLI usage

### Basic usage

```bash
refore uimap search "<task description>"
```

### Options

| Option              | Description                          |
| ------------------- | ------------------------------------ |
| `--domain [domain]` | Restrict search to a specific domain |

### Examples

```bash
# Search for a task
refore uimap search "how to create a new project in example.com"

# Search within a specific domain
refore uimap search "how to create a new project" --domain example.com

# Use a specific credential
refore --credential "My Credential" uimap search "how to create a new project"
```

## Output

The command returns operation instructions in the following format:

```markdown
## Task Goal

<task description>

To complete the task, you need to follow the operation instructions below and perform the corresponding steps in browser. After each step, check whether the necessary content for proceeding to the next step is present on the page, if the page URL does not match the expected URL (ignoring IDs or other possible dynamic parameters), analyze potential reasons based on the current page URL and content (such as not being logged in or insufficient permissions). Then inform the user of available solutions or invite them to participate in resolving the issue.

## Operation Steps

**Entry URL**: <starting-page-url>

### Step 1

- **Page**: <page-url>
- **Action**: <action-description>

### Step 2

- **Page**: <page-url>
- **Action**: <action-description>

---

Use the information above to complete the task in the browser.
```

Copy the output and use it as instructions for browser automation tools.
