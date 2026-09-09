<!-- Adding a plugin to the Notible market. One entry per PR. -->

**Plugin:** <!-- id, e.g. somedevs.kanban -->
**Repo:** <!-- https://github.com/owner/repo -->
**Latest release:** <!-- link to the GitHub Release with plugin.json + <id>.zip -->

### Submitter checklist

- [ ] The repo is **public**.
- [ ] The latest Release has assets named exactly `plugin.json` and `<id>.zip`.
- [ ] `id` is identical in `plugin.json`, the zip name, and the entry below.
- [ ] `plugin.json` has `id`, `name`, `version`, `apiVersion`, `minCoreVersion`, `entry`.
- [ ] The zip root contains `plugin.json` + the `entry` file (no top-level folder).
- [ ] A `LICENSE` is in the repo.
- [ ] I added exactly one entry to `catalog.json`, array still sorted by `id`.
- [ ] `node scripts/build-catalog.mjs --check` passes locally.

### Maintainer review

- [ ] Repo public, latest release assets present, ids match.
- [ ] License acceptable.
- [ ] Source read: no exfiltration, no remote code load / `eval` of fetched strings, no obfuscation, behaviour matches the description.
- [ ] `minCoreVersion` / `apiVersion` plausible.
- [ ] `id` / `name` do not impersonate a first-party (`notible.*`) plugin.
