/**
 * Skill Template Definitions
 */

export interface SkillTemplateDefinition {
  readonly name: string;
  readonly description: string;
  readonly files: TemplateFile[];
}

export interface TemplateFile {
  readonly path: string;
  readonly content: string;
}

// Built-in templates
export const BUILTIN_TEMPLATES: SkillTemplateDefinition[] = [
  {
    name: 'basic',
    description: 'Basic Skill template',
    files: [
      {
        path: 'SKILL.md',
        content: `# {{name}}

## Description

{{description}}

## Usage

\`\`\`bash
refore skill run {{name}}
\`\`\`

## Configuration

Edit config.json to configure.
`,
      },
      {
        path: 'config.json',
        content: `{
  "name": "{{name}}",
  "version": "1.0.0",
  "description": "{{description}}"
}
`,
      },
      {
        path: 'index.js',
        content: `#!/usr/bin/env node

async function main() {
  console.log('Hello from {{name}}!');
}

main().catch(console.error);
`,
      },
    ],
  },
];
