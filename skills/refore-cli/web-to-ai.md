# Web-to-AI

Convert a web page URL into an HTML snapshot for AI processing.

## Prerequisites

Refore credentials must be configured. See [credential.md](./credential.md).

## CLI usage

### Basic usage

```bash
refore web-to-ai <url>
```

### Options

| Option              | Description                         | Default |
| ------------------- | ----------------------------------- | ------- |
| `--width [width]`   | Viewport width in pixels            | `1920`  |
| `--height [height]` | Viewport height in pixels           | `1080`  |
| `--theme [theme]`   | Color theme (`light` or `dark`)     | `light` |
| `--locale [locale]` | Page locale (e.g. `en-US`, `zh-CN`) | —       |
| `--output [output]` | Output directory for the HTML file  | `./`    |

### Examples

```bash
# Default settings
refore web-to-ai https://example.com

# Custom viewport and dark theme
refore web-to-ai https://example.com --width 1440 --height 900 --theme dark

# Specific locale and output directory
refore web-to-ai https://example.com --locale zh-CN --output ./example.com

# Use a specific credential
refore --credential "My Credential" web-to-ai https://example.com
```
