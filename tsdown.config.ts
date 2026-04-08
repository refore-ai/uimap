import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/cli.ts',
  // Bundle all dependencies
  deps: {
    alwaysBundle: [/.*/],
    onlyBundle: false,
  },
  // Generate shebang
  shims: true,
});
