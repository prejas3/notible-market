# Notible community plugin market

This repo is the **catalog** for the Notible plugin market — a list of pointers,
one per plugin. Notible does not host or sign community plugins: authors publish
them as **GitHub Releases** on their own repos, and this catalog just points at
them. Installs in Notible show a warning that the plugin is not reviewed by
Notible for that version.

- `catalog.json` — the catalog (schema v2). The only file you edit.
- `index.json` — generated from `catalog.json` and uploaded to
  `https://updates.szymonjankiewicz.com/plugins/index.json`, which the Notible
  app fetches. Do not edit it by hand; CI regenerates it on every merge to
  `main`.
- `scripts/build-catalog.mjs` — `node scripts/build-catalog.mjs --check`
  validates `catalog.json`; without `--check` it writes `index.json`.

## Adding a plugin

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: publish a GitHub Release with
`plugin.json` + `<id>.zip` assets, then open a PR adding one entry here.

## How updates reach users

Publish a newer GitHub Release on your plugin's repo. Notible reads
`https://github.com/<owner>/<repo>/releases/latest/download/plugin.json`, so
"latest" moving is the update. No PR, no re-review for new versions of an
already-listed plugin.
