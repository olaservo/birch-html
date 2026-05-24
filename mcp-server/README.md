# birch-html-mcp

A minimal MCP server that exposes the `birch-html` skill (the canonical
`skill/SKILL.md` and all supporting files in `../skill/`) as `skill://`
resources, conformant with the
[Skills Extension SEP](https://github.com/modelcontextprotocol/experimental-ext-skills/pull/69).

The server registers:

- `skill://birch-html/SKILL.md` — the main skill body (`text/markdown`)
- `skill://index.json` — the discovery index (SEP-2640 format)
- `skill://birch-html/{+path}` — catch-all template for `recipes/`, `assets/`,
  `resources/`, `scripts/`, `styles/`

Implemented with [`@olaservo/ext-skills`](https://www.npmjs.com/package/@olaservo/ext-skills)
on top of `@modelcontextprotocol/sdk`. Transport: stdio.

## Build

```sh
npm install
npm run build
```

## Run

```sh
npm start
```

The server speaks JSON-RPC over stdin/stdout — nothing should appear on stdout
when launched directly. To exercise it interactively, point an MCP host at the
built entry point.

## Wire it into Claude Code

```sh
claude mcp add birch-html-mcp -- node /absolute/path/to/birch-html/mcp-server/dist/server.js
```

Then in a Claude Code session, `/mcp` should list `birch-html-mcp` as
connected, and the skill is available via the host's resource browser.

## Wire it into Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "birch-html": {
      "command": "node",
      "args": ["/absolute/path/to/birch-html/mcp-server/dist/server.js"]
    }
  }
}
```

## Inspect

```sh
npx @modelcontextprotocol/inspector node dist/server.js
```

## Related

- [Skills Extension SDK](https://github.com/modelcontextprotocol/experimental-ext-skills) — the SDK this wraps
- [SEP-2640](https://github.com/modelcontextprotocol/experimental-ext-skills/pull/69) — the spec
