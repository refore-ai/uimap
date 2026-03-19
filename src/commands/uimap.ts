import { Argument, Command, Option } from 'commander';
import { createCurrentCredentialAPI } from '../lib';
import type { APIClient } from '../lib';
import consola from 'consola';
import { oraPromise } from 'ora';
import z from 'zod';

export const SEARCH_UIMAP_PARAMS_SCHEMA = z.object({
  domain: z.string().optional().describe('The domain of website'),
  task: z.string().describe('Restrict search to a specific domain'),
});

export type ISearchUIMapGuideParams = z.infer<typeof SEARCH_UIMAP_PARAMS_SCHEMA>;

export async function searchUIMapGuide(api: APIClient, params: ISearchUIMapGuideParams) {
  return api.$fetch<{ instruction: string }>('/api/uimap/search-guide', {
    method: 'POST',
    body: params,
  });
}

type IUIMapSearchOptions = Omit<z.infer<typeof SEARCH_UIMAP_PARAMS_SCHEMA>, 'task'>;

export const SearchCommand = new Command('search')
  .description('Search a page operation guide for your task')
  .addOption(new Option('--domain [domain]', SEARCH_UIMAP_PARAMS_SCHEMA.shape.domain.description))
  .addArgument(new Argument('<task>', SEARCH_UIMAP_PARAMS_SCHEMA.shape.task.description))
  .action(async (task: string, options: IUIMapSearchOptions) => {
    const api = createCurrentCredentialAPI();

    const response = await oraPromise(searchUIMapGuide(api, { task, ...options }), {
      text: 'Searching uimap...',
      successText: 'Search complete.',
      failText: (err: Error) => err.message,
    });

    console.log(`\n${response.instruction}\n`);

    consola.info('Copy the above instruction and paste them into your agent tool for use.');
  });
