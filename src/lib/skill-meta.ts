import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { resolveFromPackageRoot } from './resolve';
import consola from 'consola';

export const SKILL_META_FILENAME = '.skill-meta.json';

interface SkillMeta {
  checksum: string;
}

export function readSkillMeta(skillDir: string): SkillMeta | null {
  try {
    return JSON.parse(readFileSync(join(skillDir, SKILL_META_FILENAME), 'utf-8')) as SkillMeta;
  } catch {
    return null;
  }
}

export function writeSkillMeta(skillDir: string, meta: SkillMeta): void {
  writeFileSync(join(skillDir, SKILL_META_FILENAME), JSON.stringify(meta, null, 2), 'utf-8');
}

function readBuiltinChecksums(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(resolveFromPackageRoot('skills/checksums.json'), 'utf-8')) as Record<string, string>;
  } catch {
    return {};
  }
}

export function getBuiltinChecksum(skillName: string): string | null {
  return readBuiltinChecksums()[skillName] ?? null;
}

/**
 * Warns if any installed skill differs from the bundled version.
 * Reads pre-computed checksums from skills/checksums.json — no crypto at runtime.
 */
export function checkSkillOutdated() {
  const installDir = resolve(process.cwd(), '.agents/skills');
  if (!existsSync(installDir)) return;

  const checksums = readBuiltinChecksums();
  if (Object.keys(checksums).length === 0) return;

  const outdated = readdirSync(installDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => {
      const builtinChecksum = checksums[entry.name];
      if (!builtinChecksum) return false;
      const meta = readSkillMeta(join(installDir, entry.name));
      if (!meta) return false;
      return meta.checksum !== builtinChecksum;
    })
    .map((entry) => entry.name);

  if (outdated.length > 0) {
    consola.info(`Skill update available. Run \`uimap add-skill\` to update.`);
  }
}
