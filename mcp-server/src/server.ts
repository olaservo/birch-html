#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  declareSkillsExtension,
  registerSkillResources,
  scanDocuments,
} from "@olaservo/ext-skills/server";
import type { SkillMetadata } from "@olaservo/ext-skills";
import { parse as parseYaml } from "yaml";

const here = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(here, "../../skill");
const skillMdPath = path.join(skillDir, "SKILL.md");

const stat = fs.statSync(skillMdPath);
const content = fs.readFileSync(skillMdPath, "utf-8");

const frontmatter = extractFrontmatter(content);
const name = requireString(frontmatter.name, "name");
const description = requireString(frontmatter.description, "description");

if (name !== "birch-html") {
  throw new Error(
    `Unexpected skill name in frontmatter: "${name}" (expected "birch-html")`,
  );
}

const skill: SkillMetadata = {
  name,
  skillPath: "birch-html",
  description,
  absolutePath: skillMdPath,
  skillDir,
  documents: scanDocuments(skillDir, skillDir),
  size: stat.size,
  lastModified: stat.mtime.toISOString(),
};

const skillMap = new Map<string, SkillMetadata>([[skill.skillPath, skill]]);

const server = new McpServer(
  { name: "birch-html-mcp", version: "0.1.0" },
  { capabilities: { resources: {} } },
);

declareSkillsExtension(server.server);

registerSkillResources(server, skillMap, skillDir, {
  template: true,
  audience: ["assistant"],
});

await server.connect(new StdioServerTransport());

function extractFrontmatter(text: string): Record<string, unknown> {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error(`SKILL.md at ${skillMdPath} is missing YAML frontmatter`);
  }
  const parsed = parseYaml(match[1]);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`SKILL.md frontmatter must be a YAML mapping`);
  }
  return parsed as Record<string, unknown>;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`SKILL.md frontmatter missing required string field: ${field}`);
  }
  return value.trim();
}
