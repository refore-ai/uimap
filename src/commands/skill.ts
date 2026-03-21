import { Argument, Command, Option } from 'commander';
import path from 'node:path';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { resolveFromPackageRoot, createCurrentCredentialAPI } from '../lib/index.js';
import AdmZip from 'adm-zip';
import consola from 'consola';

interface IAddSkillOptions {
  useSkillsAdd: boolean;
  output: string;
}

const BUILTIN_SKILLS_DIR = resolveFromPackageRoot('skills');

async function prepareSkillDir(skillId: string) {
  const api = createCurrentCredentialAPI();

  // Download and extract zip from marketplace endpoint.
  const zipArrayBuffer = await api.$fetch('/api/uimap/skill-marketplace/download', {
    query: {
      skillIds: [skillId],
    },
    responseType: 'arrayBuffer',
  });

  // Write files
  const tmpSkillDir = path.join(tmpdir(), `uimap-skill-${skillId}`);
  fs.rmSync(tmpSkillDir, { recursive: true, force: true });
  fs.mkdirSync(tmpSkillDir, { recursive: true });
  const zip = new AdmZip(Buffer.from(zipArrayBuffer));
  zip.extractAllTo(tmpSkillDir, true);

  return {
    dir: tmpSkillDir,
    skills: zip.getEntries().map((entry) => entry.entryName),
  };
}

export const AddSkillCommand = new Command('add-skill')
  .description('Add skills to local directory')
  .addArgument(
    new Argument('[skillId]', 'skillId to install from Marketplace, or omit to install built-in UIMap CLI skill'),
  )
  .addOption(new Option('--no-use-skills-add', 'no use `npx skills add` command to add skills to agent'))
  .addOption(
    new Option('-o, --output <output>', 'output directory, only effect when --no-use-skills-add enabled').default(
      '.agents/skills',
    ),
  )
  .action(async (skillId: string | undefined, options: IAddSkillOptions) => {
    let skillDir: string;
    let skills: string[];

    if (skillId) {
      const prepared = await prepareSkillDir(skillId);
      skillDir = prepared.dir;
      skills = prepared.skills;
    } else {
      skillDir = BUILTIN_SKILLS_DIR;
      skills = ['uimap'];
    }

    if (options.useSkillsAdd) {
      execSync(`DISABLE_TELEMETRY=1 npx -y skills add ${skillDir}`, {
        stdio: 'inherit',
      });
    } else {
      for (const skill of skills) {
        fs.cpSync(path.join(skillDir, skill), path.join(options.output, skill), { recursive: true, force: true });
      }
      consola.success(`${skills.length} skills have been added to ${options.output}`);
    }
  });
