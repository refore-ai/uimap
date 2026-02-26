import { Command } from 'commander';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createCurrentAuthApi } from '../lib/index.js';
import { downloadWebToAiRecord, fetchWebToAiRecord, WEB_TO_AI_PARAMS_SCHEMA } from './web-to-ai.js';
import { VERSION } from '../constants.js';
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AnySchema, ZodRawShapeCompat } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import { generateBrowserOperationsInstruction, SEARCH_UIMAP_PARAMS_SCHEMA, searchUIMap } from './uimap.js';

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

export const McpCommand = new Command('mcp').description('Start Refore MCP server').action(async () => {
  const api = createCurrentAuthApi();

  const server = new McpServer({ name: 'refore', version: VERSION }, { capabilities: { tools: {} } });

  server.registerTool(
    'web_to_ai',
    {
      description: 'Convert a website to an HTML snapshot for AI processing.',
      inputSchema: WEB_TO_AI_PARAMS_SCHEMA,
    },
    createToolExecuter<typeof WEB_TO_AI_PARAMS_SCHEMA>(async (args) => {
      const record = await fetchWebToAiRecord(api, args);

      const files = await downloadWebToAiRecord(record, args.output);

      return {
        content: [{ type: 'text', text: `Website converted HTML snapshot saved to ${files.join(', ')}` }],
      };
    }),
  );

  server.registerTool(
    'search_uimap',
    {
      description: 'Search for operation guides to complete tasks on websites.',
      inputSchema: SEARCH_UIMAP_PARAMS_SCHEMA,
    },
    createToolExecuter<typeof SEARCH_UIMAP_PARAMS_SCHEMA>(async (args) => {
      const result = await searchUIMap(api, args);

      const instruction = generateBrowserOperationsInstruction(result);

      return {
        content: [{ type: 'text', text: instruction }],
      };
    }),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
});
