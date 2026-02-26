import { Argument, Command, Option } from 'commander';
import { createCurrentAuthApi } from '../lib';
import type { APIClient } from '../lib';
import consola from 'consola';
import { oraPromise } from 'ora';
import z from 'zod';

export const SEARCH_UIMAP_PARAMS_SCHEMA = z.object({
  domain: z.string().optional().describe('The domain of website'),
  task: z.string().describe('What you want to do in the website'),
});

// Query result for AI Agent
export interface UIMapStep {
  order: number;
  pageUrl: string;
  action: string;
  interactionType: string;
  elementSelector: string;
  ancestorSelector?: string;
  elementText?: string;
}

// 扩展的查询结果，包含 Surface trigger 信息
export interface UiMapResult {
  task: string;
  targetNode: {
    type: 'PAGE' | 'SURFACE';
    url: string;
    stateKey?: string; // 仅 SURFACE 节点
    title: string;
    description: string;
  };
  // 从入口到目标的路径
  path: {
    entryUrl: string;
    steps: UIMapStep[];
  };
}

export function generateBrowserOperationsInstruction(uimap: UiMapResult): string {
  const { task, path } = uimap;

  let instructions = `## Task Goal\n${task}\n\n`;

  instructions +=
    `To complete the task, you need to follow the operation instructions below and perform the corresponding steps in browser. After each step, check whether the necessary content for proceeding to the next step is present on the page.\n` +
    `If the page URL does not match the expected URL (ignoring IDs or other possible dynamic parameters), analyze potential reasons based on the current page URL and content (such as not being logged in or insufficient permissions), then research the steps from current page to target page or inform the user of available solutions or invite them to participate in resolving the issue.\n\n`;

  // Target page info
  // instructions += `## Target Page\n`;
  // instructions += `- **Page Title**: ${targetNode.title}\n`;
  // instructions += `- **URL**: ${targetNode.url}\n`;
  // instructions += `- **Description**: ${targetNode.description}\n\n`;

  // Operation steps
  instructions += `## Operation Steps\n\n`;
  instructions += `**Entry URL**: ${path.entryUrl}\n\n`;

  if (path.steps.length > 0) {
    path.steps.forEach((step, index) => {
      instructions += `### Step ${index + 1}\n\n`;
      instructions += `- **Page**: ${step.pageUrl}\n`;
      instructions += `- **Action**: ${step.action}\n`;
    });
  } else {
    instructions += `You can obtains information from the page directly\n\n`;
  }

  instructions += `---\n`;
  instructions += `Use the information above to complete the task in the browser.`;

  return instructions;
}

export type ISearchUIMapParams = z.infer<typeof SEARCH_UIMAP_PARAMS_SCHEMA>;

export async function searchUIMap(api: APIClient, params: ISearchUIMapParams) {
  return api.fetch<UiMapResult>('/api/uimap/query', {
    method: 'POST',
    body: params,
  });
}

type IUIMapSearchOptions = Omit<z.infer<typeof SEARCH_UIMAP_PARAMS_SCHEMA>, 'task'>;

export const UIMapCommand = new Command('uimap').addCommand(
  new Command('search')
    .description('Search a page operation guide for your task')
    .addOption(new Option('--domain [domain]', SEARCH_UIMAP_PARAMS_SCHEMA.shape.domain.description))
    .addArgument(new Argument('<task>', SEARCH_UIMAP_PARAMS_SCHEMA.shape.task.description))
    .action(async (task: string, options: IUIMapSearchOptions) => {
      const api = createCurrentAuthApi();

      const response = await oraPromise(searchUIMap(api, { task, ...options }), {
        text: 'Searching uimap...',
        successText: 'Search complete.',
        failText: (err: Error) => err.message,
      });

      const instruction = generateBrowserOperationsInstruction(response);

      console.log(`\n${instruction}\n`);

      consola.info('Copy the above instruction and paste them into your agent tool for use.');
    }),
);
