#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run="git"

import * as path from "node:path";
import { fromFileUrl } from "jsr:@std/path";

interface DocumentMetadata {
  createdAt?: string;
  updatedAt?: string;
}

async function runGitCommand(
  args: string[],
  cwd: string,
): Promise<string | null> {
  const command = new Deno.Command("git", {
    args,
    cwd,
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();

  if (code !== 0) {
    const errorMessage = new TextDecoder().decode(stderr);
    console.error(`Git command failed: ${errorMessage}`);
    return null;
  }

  return new TextDecoder().decode(stdout).trim();
}

async function getFileCreatedAt(
  filePath: string,
  repoPath: string,
): Promise<string | null> {
  const output = await runGitCommand(
    ["log", "--follow", "--format=%at", "--reverse", "--", filePath],
    repoPath,
  );

  if (!output) return null;

  const firstCommitTimestamp = output.split("\n")[0];
  if (!firstCommitTimestamp) return null;

  const instant = Temporal.Instant.fromEpochMilliseconds(
    parseInt(firstCommitTimestamp) * 1000,
  );
  return instant.toString();
}

async function getFileUpdatedAt(
  filePath: string,
  repoPath: string,
): Promise<string | null> {
  const output = await runGitCommand(
    ["log", "-1", "--format=%at", "--", filePath],
    repoPath,
  );

  if (!output) return null;

  const timestamp = output.trim();
  if (!timestamp) return null;

  const instant = Temporal.Instant.fromEpochMilliseconds(
    parseInt(timestamp) * 1000,
  );
  return instant.toString();
}

async function generateMetadata() {
  const scriptDir = path.dirname(fromFileUrl(import.meta.url));
  const repoPath = path.join(scriptDir, "..");
  const metadataPath = path.join(repoPath, ".metadata.json");
  const docsPath = path.join(repoPath, "docs");

  const metadata: Record<string, DocumentMetadata> = {};

  try {
    const existingMetadata = await Deno.readTextFile(metadataPath);
    Object.assign(metadata, JSON.parse(existingMetadata));
  } catch {
    // do nothing
  }

  const markdownFiles: string[] = [];

  async function findMarkdownFiles(dir: string, relativePath = "") {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isFile && entry.name.endsWith(".md")) {
        const relativeFilePath = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;
        markdownFiles.push(relativeFilePath);
      } else if (entry.isDirectory && !entry.name.startsWith(".")) {
        const newRelativePath = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;
        await findMarkdownFiles(path.join(dir, entry.name), newRelativePath);
      }
    }
  }

  await findMarkdownFiles(docsPath);

  for (const file of markdownFiles) {
    const filename = file.replace(/\.md$/, "");
    const gitFilePath = `docs/${file}`;

    const createdAt =
      metadata[filename]?.createdAt ??
      (await getFileCreatedAt(gitFilePath, repoPath));
    let updatedAt = await getFileUpdatedAt(gitFilePath, repoPath);
    if (updatedAt === createdAt) updatedAt = null;

    if (createdAt || updatedAt) {
      metadata[filename] = {
        ...(createdAt && { createdAt }),
        ...(updatedAt && { updatedAt }),
      };
    }
  }

  const metadataJson = JSON.stringify(metadata, null, 2);
  await Deno.writeTextFile(metadataPath, metadataJson);
}

if (import.meta.main) {
  await generateMetadata();
}
