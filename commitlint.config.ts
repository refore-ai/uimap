import type { UserConfig } from '@commitlint/types';
import { execSync } from 'child_process';

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-chore-disallow-src': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'type-chore-disallow-src': ({ type }) => {
          // If type is not chore, pass
          if (type !== 'chore') {
            return [true];
          }

          // Get files involved in the current commit
          const files = execSync('git --no-pager diff --cached --name-only --diff-filter=ACMR', {
            encoding: 'utf-8',
          })
            .trim()
            .split('\n')
            .filter(Boolean);

          // Check if it contains files in the src directory
          const hasSrcFiles = files.some((file) => file.includes('/src/'));

          if (hasSrcFiles) {
            return [
              false,
              `You cannot use "chore" type for files in the src directory, please use "feat", "fix", "refactor" instead`,
            ];
          }

          return [true];
        },
      },
    },
  ],
} satisfies UserConfig;
