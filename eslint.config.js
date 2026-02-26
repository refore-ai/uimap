import { ignores, combine, javascript, typescript, imports } from '@antfu/eslint-config';
import prettierRecommend from 'eslint-plugin-prettier/recommended';

export default combine(
  ignores(),
  javascript(),
  typescript({
    overrides: {
      'ts/ban-ts-comment': 'off',
      'ts/no-redeclare': 'off',
    },
  }),
  imports(),
  prettierRecommend,
);
