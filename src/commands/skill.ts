import { Argument, Command, Option } from 'commander';
import path from 'node:path';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { pinyin } from 'pinyin-pro';
import { execSync } from 'node:child_process';
import { resolveFromPackageRoot, createCurrentCredentialAPI } from '../lib/index.js';
import { guard } from 'radashi';

interface IAddSkillOptions {
  useSkillsAdd: boolean;
  output: string;
}

interface UIMapSkill {
  id: string;
  name: string;
  description: string;
  content: string;
  domain: string;
  contentUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

const BUILTIN_SKILLS_DIR = resolveFromPackageRoot('skills');

async function prepareSkillDir(skillId: string) {
  const api = createCurrentCredentialAPI();
  const skill = await api.fetch<UIMapSkill>(`/api/uimap/skill-marketplace/${skillId}`);
  const folderName = pinyin(skill.name, {
    type: 'string',
    toneType: 'none',
    nonZh: 'consecutive',
  })
    .replaceAll(/\s+/g, '-')
    .toLowerCase();

  const tmpSkillDir = path.join(tmpdir(), folderName);

  // Write files
  fs.mkdirSync(tmpSkillDir, { recursive: true });

  const skillMDContent = [`---`, `name: ${skill.name}`, `description: ${skill.description}`, `---`, skill.content].join(
    '\n',
  );

  fs.writeFileSync(path.join(tmpSkillDir, 'SKILL.md'), skillMDContent, 'utf-8');
  fs.writeFileSync(
    path.join(tmpSkillDir, 'uimap-meta.json'),
    JSON.stringify({ id: skill.id, contentUpdatedAt: skill.contentUpdatedAt }, null, 2),
    'utf-8',
  );

  await guard(() =>
    api.fetch(`/api/uimap/skill-marketplace/${skillId}/download`, {
      method: 'POST',
    }),
  );

  return tmpSkillDir;
}

export const AddSkillCommand = new Command('add-skill')
  .description('Add skills to local directory')
  .addArgument(
    new Argument('[skillId]', 'skillId to install from Marketplace, or omit to install built-in UIMap CLI skill'),
  )
  .addOption(new Option('--no-use-skills-add', 'no use `npx skills add` command to add skills to agent').default(false))
  .addOption(
    new Option('-o, --output <output>', 'output directory, only effect when --no-use-skills-add enabled').default(
      './.agents/skills',
    ),
  )
  .action(async (skillId: string | undefined, options: IAddSkillOptions) => {
    let skillDir: string;

    if (skillId) {
      skillDir = await prepareSkillDir(skillId);
    } else {
      skillDir = path.join(BUILTIN_SKILLS_DIR, 'uimap');
    }

    if (options.useSkillsAdd) {
      execSync(`DISABLE_TELEMETRY=1 npx -y skills add ${skillDir}`, {
        stdio: 'inherit',
      });
    } else {
      fs.cpSync(skillDir, path.join(options.output, path.basename(skillDir)), { recursive: true, force: true });
    }
  });
