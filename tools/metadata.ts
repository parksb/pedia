#!/usr/bin/env -S deno run --allow-read --allow-write

import * as path from "node:path";
import { fromFileUrl } from "jsr:@std/path";

interface DocumentMetadata {
  createdAt?: string;
  updatedAt?: string;
}

function getCurrentTimeUTC(): string {
  return Temporal.Now.instant().round({ smallestUnit: "second" }).toString();
}

async function loadMetadata(): Promise<Record<string, DocumentMetadata>> {
  const scriptDir = path.dirname(fromFileUrl(import.meta.url));
  const repoPath = path.join(scriptDir, "..");
  const metadataPath = path.join(repoPath, ".metadata.json");

  try {
    const existingMetadata = await Deno.readTextFile(metadataPath);
    return JSON.parse(existingMetadata);
  } catch {
    return {};
  }
}

async function saveMetadata(metadata: Record<string, DocumentMetadata>) {
  const scriptDir = path.dirname(fromFileUrl(import.meta.url));
  const repoPath = path.join(scriptDir, "..");
  const metadataPath = path.join(repoPath, ".metadata.json");

  const metadataJson = JSON.stringify(metadata, null, 2);
  await Deno.writeTextFile(metadataPath, metadataJson);
}

async function createDocument(files: string[]) {
  const metadata = await loadMetadata();

  for (const file of files) {
    const filename = file.replace(/\.md$/, "");

    if (metadata[filename]) continue;

    const createdAt = getCurrentTimeUTC();
    metadata[filename] = { createdAt };
    console.log(`Added: ${filename}`);
  }

  await saveMetadata(metadata);
}

async function updateDocument(files: string[]) {
  const metadata = await loadMetadata();

  for (const file of files) {
    const filename = file.replace(/\.md$/, "");

    if (!metadata[filename]) continue;

    const updatedAt = getCurrentTimeUTC();
    if (updatedAt !== metadata[filename].createdAt) {
      metadata[filename].updatedAt = updatedAt;
      console.log(`Updated: ${filename}`);
    }
  }

  await saveMetadata(metadata);
}

if (import.meta.main) {
  const args = Deno.args;

  if (args.length < 2) {
    console.error(
      "Usage: metadata_update.ts <create|update> <file1.md> [file2.md] ...",
    );
    Deno.exit(1);
  }

  const command = args[0];
  const files = args.slice(1);

  if (command === "create") {
    await createDocument(files);
  } else if (command === "update") {
    await updateDocument(files);
  } else {
    console.error("Unknown command:", command);
    Deno.exit(1);
  }
}
