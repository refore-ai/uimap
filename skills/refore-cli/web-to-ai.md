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

---

## API direct access

> For obtaining an Access Token, see [credential.md](./credential.md).

### Endpoint

```
POST /api/web-to-ai/record-by-url
```

### Request

```bash
curl -X POST https://api.demoway.com/api/web-to-ai/record-by-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "url": "https://example.com",
    "width": 1920,
    "height": 1080,
    "theme": "light",
    "locale": "en-US"
  }'
```

### Request parameters

| Parameter | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| `url`     | string | Yes      | Target web page URL                  |
| `width`   | number | No       | Viewport width (default: 1920)       |
| `height`  | number | No       | Viewport height (default: 1080)      |
| `theme`   | string | No       | `light` or `dark` (default: `light`) |
| `locale`  | string | No       | Browser locale (e.g. `en-US`)        |

### Response

```json
{
  "data": {
    "id": "<record-id>",
    "urls": ["https://s.refore.ai/s/xxx"]
  }
}
```

| Field  | Description                             |
| ------ | --------------------------------------- |
| `id`   | Unique identifier for the Refore record |
| `urls` | CDN URLs to download the HTML snapshot  |

### Complete script example

```bash
#!/bin/bash

API_KEY="your-api-key"
APP_ID="your-app-id"
BASE_URL="https://api.demoway.com"
TARGET_URL="https://example.com"

# Get access token
TOKEN=$(curl -s -X POST "$BASE_URL/api/open-auth/token" \
  -H "Content-Type: application/json" \
  -d "{\"apiKey\": \"$API_KEY\", \"appId\": \"$APP_ID\", \"scope\": [\"cli\"]}" \
  | jq -r '.data.accessToken')

# Convert web page
RESULT=$(curl -s -X POST "$BASE_URL/api/web-to-ai/record-by-url" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"url\": \"$TARGET_URL\", \"width\": 1920, \"height\": 1080, \"theme\": \"light\"}")

# Download HTML
DOWNLOAD_URL=$(echo $RESULT | jq -r '.data.urls[0]')
curl -o "refore-record.html" "$DOWNLOAD_URL"
```
