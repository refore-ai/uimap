
# DEVELOPMENT

## Development And Testing For Local Agent

1. link uimap to global bin

```bash
pnpm link
uimap --version
```

2. add skills to local directory

```bash
uimap add-skill
```

By default skills are installed to `./.agents/skills`. Use `-o` to override:

```bash
uimap add-skill -o /path/to/skills
```

3. login

```bash
uimap login
UIMAP_ENABLE_CUSTOM_SERVER=true uimap login # if you want to use custom server url and oauth origin
```

4. test uimap in local agent tools


## Managing multiple credentials

Get your API Key and App ID from the [UIMap API Key page](https://uimap.ai/user/api-key), then:

```bash
uimap credential add
```

You will be prompted for:

- **Server** — `Default (outside mainland China)`, `China`, or a custom URL
- **API Key** — Your UIMap API key
- **App ID** — Your application ID

You can also set the credential by environment variables in your shell:

```bash
export UIMAP_SERVER=<China or World>
export UIMAP_API_KEY=<your_api_key>
export UIMAP_APP_ID=<your_app_id>
```

## CDN Release (For users with npm network restrictions)

In addition to npm publishing, we also support CDN distribution for users with network restrictions.

### Configure CDN

1. Copy the example config file:

```bash
cp .cdn-config.example .cdn-config
```

2. Edit `.cdn-config` and fill in your CDN configuration:

```bash
# Example: Tencent Cloud COS
CDN_BASE_URL="https://uimap-123456.cos.ap-beijing.myqcloud.com"  # URL for user downloads
CDN_UPLOAD_URL="cos://static/uimap/"                              # Upload address
CDN_UPLOAD_CMD="coscli cp"                                         # Upload command
```

**Configuration Notes:**
- `CDN_BASE_URL`: URL used by users to download files (HTTP/HTTPS)
- `CDN_UPLOAD_URL`: Actual upload address to storage (e.g., `cos://`, `oss://`, `s3://`)
- `CDN_UPLOAD_CMD`: Upload command tool (e.g., `coscli cp`, `ossutil cp`, `aws s3 cp`)

### Release Process

```bash
# Release current version (read version from package.json)
pnpm run release:cdn

# Or specify version
./scripts/release-cdn.sh 0.1.4
```

The script will:
1. Build project (`pnpm run build`)
2. Package `dist/`, `skills/` and other necessary files
3. Generate install script (auto-inject CDN URL)
4. Output file list and commands for CDN upload

### Upload Files

If `CDN_UPLOAD_CMD` is not configured, the script will display files that need manual upload:

```
releases/install.sh          -> https://your-cdn/uimap/install.sh
releases/uimap-0.1.3.tar.gz  -> https://your-cdn/uimap/releases/0.1.3/uimap-0.1.3.tar.gz
releases/uimap-latest.tar.gz -> https://your-cdn/uimap/releases/latest/uimap-latest.tar.gz
```

### User Installation

After configuring CDN, users can install via:

```bash
# Install latest version
curl -fsSL https://your-cdn/uimap/install.sh | bash

# Install specific version
curl -fsSL https://your-cdn/uimap/install.sh | VERSION=0.1.3 bash
```
