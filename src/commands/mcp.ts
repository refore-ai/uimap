import { Command } from 'commander';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createCurrentCredentialAPI } from '../lib/index.js';
import { VERSION } from '../constants.js';
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AnySchema, ZodRawShapeCompat } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import { SEARCH_UIMAP_PARAMS_SCHEMA, searchUIMapGuide } from './uimap.js';

export function createToolExecuter<Args extends undefined | ZodRawShapeCompat | AnySchema = undefined>(
  fn: ToolCallback<Args>,
) {
  const wrappedFn = async (...args: any[]) => {
    try {
      // @ts-ignore
      return await fn(...args);
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error: ${(error as Error).message}`,
          },
        ],
      };
    }
  };

  return wrappedFn as ToolCallback<Args>;
}

export const McpCommand = new Command('mcp').description('Start UIMap MCP server').action(async () => {
  const server = new McpServer({ name: 'uimap', version: VERSION });
  const api = createCurrentCredentialAPI();

  server.registerTool(
    'search_uimap',
    {
      description: 'Search for operation guides to complete tasks through browser automation.',
      inputSchema: SEARCH_UIMAP_PARAMS_SCHEMA,
    },
    createToolExecuter<typeof SEARCH_UIMAP_PARAMS_SCHEMA>(async (args) => {
      const result = await searchUIMapGuide(api, args);

      return {
        content: [{ type: 'text', text: result.instruction }],
      };
    }),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
});
