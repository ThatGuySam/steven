#!/usr/bin/env node

/**
 * Creates Cloudflare KV namespaces for the project if they haven't been
 * configured yet (i.e. wrangler.jsonc still contains placeholder IDs).
 *
 * This script is idempotent — it skips creation when real IDs are already
 * present and reuses existing namespaces when possible.
 *
 * Requires: CLOUDFLARE_API_TOKEN (or `wrangler login` session)
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, "..", "wrangler.jsonc");
const PLACEHOLDER_ID = "YOUR_KV_NAMESPACE_ID";
const PLACEHOLDER_PREVIEW_ID = "YOUR_KV_PREVIEW_ID";
const WORKER_NAME = "steven";
const BINDING_NAME = "BOOKINGS";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd) {
  return execSync(cmd, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}

function parseNamespaceId(output) {
  // wrangler prints a JSON-like snippet containing the id
  const match = output.match(/"id"\s*:\s*"([a-f0-9]+)"/);
  if (!match) {
    throw new Error(
      `Could not parse namespace ID from wrangler output:\n${output}`,
    );
  }
  return match[1];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let config = readFileSync(CONFIG_PATH, "utf-8");

const needsProd = config.includes(PLACEHOLDER_ID);
const needsPreview = config.includes(PLACEHOLDER_PREVIEW_ID);

if (!needsProd && !needsPreview) {
  console.log("KV namespace IDs already configured — skipping setup.");
  process.exit(0);
}

console.log("Setting up KV namespaces…");

// Fetch existing namespaces so we can reuse them if they already exist.
let namespaces = [];
try {
  namespaces = JSON.parse(run("npx wrangler kv namespace list"));
} catch {
  // If listing fails we'll just create new ones.
}

// --- Production namespace ---------------------------------------------------
if (needsProd) {
  const title = `${WORKER_NAME}-${BINDING_NAME}`;
  const existing = namespaces.find((ns) => ns.title === title);

  let id;
  if (existing) {
    id = existing.id;
    console.log(`Reusing existing namespace "${title}" → ${id}`);
  } else {
    console.log(`Creating namespace "${title}"…`);
    const out = run(`npx wrangler kv namespace create ${BINDING_NAME}`);
    id = parseNamespaceId(out);
    console.log(`Created namespace "${title}" → ${id}`);
  }

  config = config.replace(PLACEHOLDER_ID, id);
}

// --- Preview namespace ------------------------------------------------------
if (needsPreview) {
  const title = `${WORKER_NAME}-${BINDING_NAME}_preview`;
  const existing = namespaces.find((ns) => ns.title === title);

  let id;
  if (existing) {
    id = existing.id;
    console.log(`Reusing existing preview namespace "${title}" → ${id}`);
  } else {
    console.log(`Creating preview namespace "${title}"…`);
    const out = run(
      `npx wrangler kv namespace create ${BINDING_NAME} --preview`,
    );
    id = parseNamespaceId(out);
    console.log(`Created preview namespace "${title}" → ${id}`);
  }

  config = config.replace(PLACEHOLDER_PREVIEW_ID, id);
}

// --- Write updated config ---------------------------------------------------
writeFileSync(CONFIG_PATH, config);
console.log("Updated wrangler.jsonc with KV namespace IDs.");
