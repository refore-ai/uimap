import { Command, Option } from 'commander';
import path from 'node:path';
import fs, { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolveFromPackageRoot } from '../lib/index.js';
import consola from 'consola';

// ========== Skill Configuration ==========
interface ISkillAddOptions {
  output: string;
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

export const AddSkillCommand = new Command('add-skill')
  .description('Add skills to local directory')
  .addOption(
    new Option('-o, --output <directory>', 'Specify directory to install to').default(
      path.join(homedir(), '.agents/skills'),
    ),
  )
  .action(async (options: ISkillAddOptions) => {
    const targetDir = path.resolve(options.output);
    await installSkill('uimap', targetDir);

    consola.success(
      `Skill installed.\n` +
        `  If you want to add skills in different agent directories, please use: \n` +
        `  \`npx skills add refore-ai/uimap --skill uimap\``,
    );
  });
