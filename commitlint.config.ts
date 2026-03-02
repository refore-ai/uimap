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
          // 如果 type 不是 chore，则通过
          if (type !== 'chore') {
            return [true];
          }

          // 获取当前提交涉及的文件
          const files = execSync('git --no-pager diff --cached --name-only --diff-filter=ACMR', {
            encoding: 'utf-8',
          })
            .trim()
            .split('\n')
            .filter(Boolean);

          // 检查是否包含 src 目录下的文件
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
