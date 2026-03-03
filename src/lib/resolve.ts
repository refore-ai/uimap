import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { PACKAGE_NAME } from '../constants';

let cachedRoot: string | null = null;

/**
 * Find the package root (directory containing package.json with name "@refore-ai/uimap")
 * by walking up from the current module's directory.
 * Works in both development (src/) and after build (dist/), and when installed (node_modules/@refore-ai/uimap).
 */
function getPackageRoot(): string {
  if (cachedRoot) {
    return cachedRoot;
  }

  const __filename = fileURLToPath(import.meta.url);
  let dir = dirname(__filename);

  while (dir !== dirname(dir)) {
    const pkgPath = resolve(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const content = readFileSync(pkgPath, 'utf-8');
        const pkg = JSON.parse(content) as { name?: string };
        if (pkg?.name === PACKAGE_NAME) {
          cachedRoot = dir;
          return dir;
        }
      } catch {
        // ignore read/parse errors
      }
    }
    dir = dirname(dir);
  }

  throw new Error(`Package root not found (looking for ${PACKAGE_NAME})`);
}

/**
 * Resolve path segments relative to the package root.
 * Use for paths that must work in both dev (repo root) and after build/install (package root).
 */
export function resolveFromPackageRoot(...pathSegments: string[]): string {
  const root = getPackageRoot();
  return resolve(root, ...pathSegments);
}
