import { Command, Option } from 'commander';
import path from 'node:path';
import fs, { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { execSync } from 'node:child_process';
import { resolveFromPackageRoot, createCurrentCredentialAPI } from '../lib/index.js';
import consola from 'consola';

// ========== Skill Configuration ==========
interface ISkillAddOptions {
  output: string;
}

interface SkillApiResponse {
  id: string;
  name: string;
  description: string;
  content: string;
  domain: string;
  updatedAt: string;
}

const BUILTIN_SKILLS_DIR = resolveFromPackageRoot('skills');

// Install a skill to the target directory
async function installSkill(skillName: string, targetDir: string) {
  const sourceDir = path.join(BUILTIN_SKILLS_DIR, skillName);
  const destDir = path.join(targetDir, skillName);

  if (existsSync(destDir)) {
    await fs.promises.rm(destDir, { recursive: true, force: true });
  }

  await fs.promises.cp(sourceDir, destDir, { recursive: true });
}

// Detect if argument looks like a cuid/marketplace skill ID
function isMarketplaceSkillId(arg: string): boolean {
  return /^[a-z0-9]{20,32}$/.test(arg);
}

async function installFromMarketplace(skillId: string) {
  const api = createCurrentCredentialAPI();

  // Fetch skill data from marketplace
  const skill = await api.fetch<SkillApiResponse>(`/api/uimap/marketplace/${skillId}`);

  // Generate safe folder name
  const folderName = skill.name.replace(/[^a-zA-Z0-9\-_]/g, '-').toLowerCase();
  const skillDir = path.join(process.cwd(), folderName);

  // Write files
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skill.content, 'utf-8');
  fs.writeFileSync(
    path.join(skillDir, 'uimap-meta.json'),
    JSON.stringify({ id: skill.id, updatedAt: skill.updatedAt }, null, 2),
    'utf-8',
  );

  // Install via npx skills add (with telemetry disabled)
  console.log(`Installing ${folderName}...`);
  execSync(`DISABLE_TELEMETRY=1 npx skills add ./${folderName}`, { stdio: 'inherit' });

  // Record download (fire and forget)
  try {
    await api.fetch(`/api/uimap/marketplace/${skillId}/download`, { method: 'POST' });
  } catch {
    // Download recording failure doesn't affect installation
  }

  console.log(`\n✓ Skill "${skill.name}" installed successfully`);
}

export const AddSkillCommand = new Command('add-skill')
  .description('Add skills to local directory')
  .addOption(
    new Option('-o, --output <directory>', 'Specify directory to install to').default(
      path.join(homedir(), '.agents/skills'),
    ),
  )
  .argument('[skill-id]', 'Marketplace skill ID to install, or omit to install built-in UIMap CLI skill')
  .action(async (skillId: string | undefined, options: ISkillAddOptions) => {
    if (skillId && isMarketplaceSkillId(skillId)) {
      await installFromMarketplace(skillId);
    } else {
      // existing logic for built-in CLI skill installation
      const targetDir = path.resolve(options.output);
      await installSkill('uimap', targetDir);

      consola.success(
        `Skill installed.\n` +
          `  If you want to add skills in different agent directories, please use: \n` +
          `  \`npx skills add refore-ai/uimap --skill uimap\``,
      );
    }
  });

export const UpdateSkillsCommand = new Command('update-skills')
  .description('Check and update installed UIMap Marketplace Skills')
  .action(async () => {
    const api = createCurrentCredentialAPI();

    // Directories to scan for installed skills
    const dirsToCheck = [path.join(homedir(), '.agents/skills'), path.join(process.cwd(), '.agents/skills')];

    const installed: Array<{ id: string; updatedAt: string; dir: string; name: string }> = [];

    for (const dir of dirsToCheck) {
      if (!fs.existsSync(dir)) continue;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const metaPath = path.join(dir, entry.name, 'uimap-meta.json');
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            installed.push({
              id: meta.id,
              updatedAt: meta.updatedAt,
              dir: path.join(dir, entry.name),
              name: entry.name,
            });
          } catch {
            // Skip malformed meta files
          }
        }
      }
    }

    if (installed.length === 0) {
      console.log('No UIMap Marketplace Skills installed.');
      return;
    }

    console.log(`Found ${installed.length} installed UIMap Skill(s). Checking for updates...`);

    let updateCount = 0;
    for (const local of installed) {
      try {
        const remote = await api.fetch<SkillApiResponse>(`/api/uimap/marketplace/${local.id}`);
        if (new Date(remote.updatedAt) > new Date(local.updatedAt)) {
          console.log(`  → Updating "${local.name}"...`);
          fs.writeFileSync(path.join(local.dir, 'SKILL.md'), remote.content, 'utf-8');
          fs.writeFileSync(
            path.join(local.dir, 'uimap-meta.json'),
            JSON.stringify({ id: remote.id, updatedAt: remote.updatedAt }, null, 2),
          );
          execSync(`DISABLE_TELEMETRY=1 npx skills add ./${local.name}`, {
            stdio: 'inherit',
            cwd: path.dirname(local.dir),
          });
          updateCount++;
        } else {
          console.log(`  ✓ "${local.name}" is up to date`);
        }
      } catch {
        console.log(`  ✗ "${local.name}" failed to check (skill may have been removed)`);
      }
    }

    console.log(`\nDone. ${updateCount} skill(s) updated.`);
  });
