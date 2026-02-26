# Credential Management

## Prerequisites

Refore CLI must be installed. See [install.md](./install.md).

## Getting your credentials

Visit the [Refore AI API Key page](https://reforeai.cn/user/api-key) to obtain your API Key and App ID.

## CLI credential management

### Add a credential

```bash
refore credential add
```

You will be prompted to enter:

- **Server**: Choose `China`, `World`, or enter a custom URL
- **API Key**: Your Refore API key
- **App ID**: Your application ID

### List all credentials

```bash
refore credential list
```

### Set the default credential

```bash
refore credential default
```

### Remove credentials

```bash
refore credential remove
```

### Use a specific credential for a command

```bash
refore --credential "My Credential" <command>
```
