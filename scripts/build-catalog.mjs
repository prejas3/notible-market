/**
 * Validate catalog.json (v2, pointers only), then — unless --check — sort it,
 * stamp `generatedAt`, and write index.json (the file the Notible app fetches
 * from R2). Standalone: no dependency on the Notible app repo. The app ships
 * its own copy of this validator as the runtime gate; this one must never be
 * looser than that one.
 *
 *   node scripts/build-catalog.mjs           # write index.json
 *   node scripts/build-catalog.mjs --check   # validate only, exit non-zero on error
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CATALOG = new URL("../catalog.json", import.meta.url);
const OUT = new URL("../index.json", import.meta.url);

const ID = /^[a-z0-9]+(\.[a-z0-9-]+)+$/;
const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
const APIVER = /^\d+\.\d+$/;
/** Ids reserved for a future automated-submission model. Empty today: the
 * catalog is owner-merged by PR, so impersonation is caught in review. */
const RESERVED = new Set([]);
const ENTRY_KEYS = ["id", "name", "author", "description", "repo", "minCoreVersion", "apiVersion"];

function isRecord(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function assertString(v, label) {
  if (typeof v !== "string" || v.trim() === "") throw new Error(`${label} must be a non-empty string`);
}

/** Throws on any deviation from the v2 pointer catalog. Mirrors
 * `validatePluginCatalog` in the Notible app's src/core/extensions/update.ts. */
export function validateCatalog(value) {
  if (!isRecord(value) || value.schemaVersion !== 2) throw new Error("unsupported plugin catalog schema (expected schemaVersion 2)");
  for (const key of Object.keys(value)) {
    if (!["schemaVersion", "generatedAt", "plugins"].includes(key)) throw new Error(`catalog has an unexpected field: ${key}`);
  }
  if ("generatedAt" in value) {
    assertString(value.generatedAt, "generatedAt");
    if (Number.isNaN(Date.parse(value.generatedAt))) throw new Error("generatedAt must be an ISO date");
  }
  if (!Array.isArray(value.plugins)) throw new Error("catalog.plugins must be an array");
  const seen = new Set();
  for (const raw of value.plugins) {
    if (!isRecord(raw)) throw new Error("every catalog entry must be an object");
    for (const key of Object.keys(raw)) {
      if (!ENTRY_KEYS.includes(key)) throw new Error(`entry has an unexpected field: ${key}`);
    }
    assertString(raw.id, "entry.id");
    if (!ID.test(raw.id)) throw new Error(`invalid entry.id (namespaced lowercase, e.g. somedevs.kanban): ${raw.id}`);
    if (RESERVED.has(raw.id)) throw new Error(`reserved plugin id: ${raw.id}`);
    if (seen.has(raw.id)) throw new Error(`duplicate catalog entry: ${raw.id}`);
    seen.add(raw.id);
    assertString(raw.name, "entry.name");
    assertString(raw.author, "entry.author");
    assertString(raw.description, "entry.description");
    assertString(raw.repo, "entry.repo");
    if (!REPO.test(raw.repo)) throw new Error(`entry.repo must be "owner/name" on github.com: ${raw.repo}`);
    if (raw.repo.split("/").some((part) => part === "." || part === "..")) throw new Error(`entry.repo must not contain "." or ".." path segments: ${raw.repo}`);
    if (!SEMVER.test(raw.minCoreVersion)) throw new Error(`entry.minCoreVersion must be x.y.z: ${raw.minCoreVersion}`);
    if (!APIVER.test(raw.apiVersion)) throw new Error(`entry.apiVersion must be major.minor: ${raw.apiVersion}`);
  }
}

export function buildIndex(source) {
  validateCatalog(source);
  const stamped = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    plugins: [...source.plugins].sort((a, b) => String(a.id).localeCompare(String(b.id))),
  };
  validateCatalog(stamped);
  return stamped;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  let source;
  try {
    source = JSON.parse(readFileSync(CATALOG, "utf8"));
  } catch (error) {
    console.error(`catalog.json is not valid JSON: ${error.message}`);
    process.exit(1);
  }
  try {
    validateCatalog(source);
  } catch (error) {
    console.error(`catalog.json: ${error.message}`);
    process.exit(1);
  }
  if (check) {
    console.log(`catalog.json OK (${source.plugins.length} entries).`);
  } else {
    const index = buildIndex(source);
    writeFileSync(OUT, JSON.stringify(index, null, 2) + "\n");
    console.log(`Wrote index.json (${index.plugins.length} entries).`);
  }
}
