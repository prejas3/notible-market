# Submitting a plugin to the Notible market

The market is a moderated catalog of **pointers**. Notible does not host or
sign community plugins — you host them on GitHub Releases, and the Notible
client verifies nothing cryptographically. Every install shows the user a
warning that the plugin is not reviewed by Notible for that version, and runs
with full access to their workspace and the internet.

## 1. Build your plugin

Use the Developer Pack (Notible → Settings → Plugins → *Export developer pack*)
for the API reference and a working example. Your build must produce two files:

- **`plugin.json`** — the manifest:
  ```json
  {
    "id": "somedevs.kanban",
    "name": "Kanban",
    "version": "1.0.0",
    "apiVersion": "1.11",
    "minCoreVersion": "0.80.0",
    "author": "SomeDevs",
    "description": "A board view for tasks.",
    "entry": "main.js",
    "permissions": ["data.read", "workspace.ui"]
  }
  ```
  `id` is namespaced and lowercase: `^[a-z0-9]+(\.[a-z0-9-]+)+$`. It must be
  identical in the manifest, the zip name, and the catalog entry.

- **`<id>.zip`** — a zip whose **root** contains `plugin.json` and the entry
  file (plus any other assets). No top-level folder. Limits enforced on
  install: 50 MiB total, 1000 entries, 10 MiB per file. No symlinks, no `..`
  paths, no absolute paths.

## 2. Publish a GitHub Release

On your plugin's public repo, create a Release and attach **both** files as
assets, named exactly `plugin.json` and `<id>.zip`. Tag it however you like.

Notible always reads:
- `https://github.com/<owner>/<repo>/releases/latest/download/plugin.json`
- `https://github.com/<owner>/<repo>/releases/latest/download/<id>.zip`

so **"latest" must point at the release you want users to get**. Publishing a
newer release later is how you ship an update — there is no re-review for new
versions.

The repo must be **public** — private-repo release assets are not reachable
without a token.

## 3. Open a PR here

Fork this repo, add **one entry** to `catalog.json` (keep the array sorted by
`id`), and open a pull request:

```json
{
  "id": "somedevs.kanban",
  "name": "Kanban",
  "author": "SomeDevs",
  "description": "A board view for tasks.",
  "repo": "somedevs/notible-kanban",
  "minCoreVersion": "0.80.0",
  "apiVersion": "1.11"
}
```

`node scripts/build-catalog.mjs --check` validates your change; CI runs the
same check on the PR.

## What the maintainer checks (one time, per plugin)

- The `repo` exists and is public; its latest Release has `plugin.json` +
  `<id>.zip`; the `id` matches across all three.
- License is stated and acceptable.
- A read of the source: no credential/data exfiltration, no remote code
  loading or `eval` of fetched strings, no deliberate obfuscation, and the
  declared behaviour matches the code.
- `minCoreVersion` / `apiVersion` are plausible for what the plugin does.
- The `id` and `name` do not impersonate a first-party (`notible.*`) plugin.

Approval = merging the PR. On merge, CI regenerates `index.json` and uploads it
to R2 — the plugin is live in the market within a minute.

There is **no re-review** for later versions: once a plugin is listed, its
GitHub Releases go straight to users. Submit a plugin only if you would vouch
for its author continuing to publish responsibly.
