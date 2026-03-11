import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/cli.ts',
  // Bundle all dependencies, don't mark as external
  noExternal: [/.*/],
  // Generate shebang
  shims: true,
});
