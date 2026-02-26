import { Command, Option } from 'commander';
import { resolve, join } from 'node:path';
import fs, { existsSync, readdirSync } from 'node:fs';
import { resolveFromPackageRoot, getBuiltinChecksum, writeSkillMeta } from '../lib/index.js';
import consola from 'consola';

// ========== Skill Configuration ==========
interface ISkillAddOptions {
  output: string;
}

const BUILTIN_SKILLS_DIR = resolveFromPackageRoot('skills');
// List all available built-in skills
function listBuiltinSkills(): string[] {
  return readdirSync(BUILTIN_SKILLS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

// Install a skill to the target directory
async function installSkill(skillName: string, targetDir: string) {
  const sourceDir = join(BUILTIN_SKILLS_DIR, skillName);
  const destDir = join(targetDir, skillName);

  if (existsSync(destDir)) {
    await fs.promises.rm(destDir, { recursive: true, force: true });
  }

  await fs.promises.cp(sourceDir, destDir, { recursive: true });
  const checksum = getBuiltinChecksum(skillName);
  if (checksum) {
    writeSkillMeta(destDir, { checksum });
  }
}

export const AddSkillCommand = new Command('add-skill')
  .description('Add skills to local directory')
  // .addArgument(
  //   new Argument('[name]', 'Skill name to install (use "all" to install all skills)')
  //     .choices(['all', ...listBuiltinSkills()])
  //     .default('all'),
  // )
  .addOption(new Option('-o, --output <directory>', 'Specify directory to install to').default('./.agents/skills'))
  .addHelpText(
    'after',
    '\nIf you want multiple agent directories or other complex usage, please use: `npx skills add refore-ai/cli [name]` or refer to https://skills.sh',
  )
  .action(async (options: ISkillAddOptions) => {
    const availableSkills = listBuiltinSkills();
    // Determine which skills to install
    // const skillsToInstall = name === 'all' ? availableSkills : name.split(',').map((skill) => skill.trim());

    const targetDir = resolve(process.cwd(), options.output);
    // Install the skill(s)
    for (const skillName of availableSkills) {
      await installSkill(skillName, targetDir);
    }

    consola.success(`Skill installed.`);
  });
