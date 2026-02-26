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

---

## API direct access: getting an Access Token

If you need to call the API directly with curl or an HTTP client, first obtain an Access Token.

### Request

```bash
# World region
curl -X POST https://api.demoway.com/api/open-auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "YOUR_API_KEY",
    "appId": "YOUR_APP_ID",
    "scope": ["cli"]
  }'

# China region
curl -X POST https://api.demoway.cn/api/open-auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "YOUR_API_KEY",
    "appId": "YOUR_APP_ID",
    "scope": ["cli"]
  }'
```

### Response

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Using the token

Include it in the `Authorization` header for subsequent API calls:

```bash
curl -X POST https://api.demoway.com/api/<endpoint> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{ ... }'
```
