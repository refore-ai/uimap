/**
 * Build-time script: computes checksums for all bundled skills and writes skills/checksums.json.
 * Run via `prebuild` so the file is always in sync before packaging.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import consola from 'consola';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillsDir = join(__dirname, '../skills');
const outputPath = join(skillsDir, 'checksums.json');

const SKIP_FILES = new Set(['checksums.json']);

function getAllFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP_FILES.has(entry.name)) return [];
    const fullPath = join(dir, entry.name);
    return entry.isDirectory() ? getAllFiles(fullPath) : [fullPath];
  });
}

function computeChecksum(skillDir: string): string {
  const hash = createHash('sha256');
  for (const file of getAllFiles(skillDir).sort()) {
    hash.update(relative(skillDir, file));
    hash.update(readFileSync(file));
  }
  return hash.digest('hex');
}

const skills = readdirSync(skillsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

const checksums: Record<string, string> = {};
for (const skill of skills) {
  checksums[skill] = computeChecksum(join(skillsDir, skill));
}

writeFileSync(outputPath, `${JSON.stringify(checksums, null, 2)}\n`, 'utf-8');
consola.info(`Computed checksums for: ${skills.join(', ')}`);
