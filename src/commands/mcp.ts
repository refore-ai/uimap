import { Command } from 'commander';

export const ReforeMcpCommand = new Command('refore-mcp').description('Start Refore MCP server').action(async () => {});

export const UiMapMcpCommand = new Command('uimap-mcp').description('Start UIMap MCP server').action(async () => {});
