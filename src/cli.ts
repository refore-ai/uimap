#!/usr/bin/env node
import { Command, CommanderError } from 'commander';
import { CredentialCommand, McpCommand, AddSkillCommand, UpdateSkillsCommand } from './commands/index.js';

import type { IGlobalOptions } from './types/index.js';
import { Context } from './lib';
import { VERSION } from './constants.js';
import consola, { LogLevels } from 'consola';
// import { WebToAiCommand } from './commands/web-to-ai.js';
import { SearchCommand } from './commands/uimap.js';
import { LoginCommand } from './commands/login.js';

const program = new Command()
  .name('uimap')
  .description('A CLI for UIMap')
  .version(VERSION, '-v, --version')
  .option('-c, --credential <credential>', 'use specific credential')
  .option('--verbose', 'verbose output')
  .exitOverride()
  // set global context
  .hook('preAction', (thisCommand) => {
    Context.credential = thisCommand.opts<IGlobalOptions>().credential;
    if (thisCommand.opts<IGlobalOptions>().verbose) {
      consola.level = LogLevels.verbose;
    }
  })
  // register sub commands
  .addCommand(CredentialCommand)
  .addCommand(SearchCommand)
  .addCommand(LoginCommand)
  .addCommand(McpCommand)
  .addCommand(AddSkillCommand)
  .addCommand(UpdateSkillsCommand)
  // process unknown command
  .on('command:*', (operands) => {
    console.error(`Unknown command: ${operands[0]}`);
    console.error('Run "uimap --help" to see available commands\n');
    process.exit(1);
  });

async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    if (err instanceof CommanderError) {
      if (err.exitCode !== 0 && !err.code.startsWith('commander.')) {
        consola.error(err.message);
      }
      process.exit(err.exitCode);
    } else {
      consola.error(err);
      process.exit(1);
    }
  }
}

main();
