
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


