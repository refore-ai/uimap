import { Argument, Command, Option } from 'commander';
import { createCurrentCredentialAPI } from '../lib';
import type { APIClient } from '../lib';
import consola from 'consola';
import { oraPromise } from 'ora';
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import z from 'zod';

export const WEB_TO_AI_PARAMS_SCHEMA = z.object({
  url: z.string(),
  width: z.number().default(1920).describe('The width of the website'),
  height: z.number().default(1080).describe('The height of the website'),
  theme: z.enum(['light', 'dark']).default('light').describe('The theme of the website'),
  locale: z
    .string()
    .optional()
    .describe('The locale of the website (e.g. en-US, zh-CN), it will affect the language of the website content.'),
  output: z.string().default('./').describe('The output directory of the refore record'),
});

export type IWebToAiParams = Omit<z.input<typeof WEB_TO_AI_PARAMS_SCHEMA>, 'output'>;

type IWebToAiCommandOptions = Omit<z.infer<typeof WEB_TO_AI_PARAMS_SCHEMA>, 'url'>;

export interface IWebToAiRecord {
  id: string;
  urls: string[];
}

export async function fetchWebToAiRecord(api: APIClient, params: IWebToAiParams) {
  return api.fetch<IWebToAiRecord>('/api/web-to-ai/record-by-url', {
    method: 'POST',
    body: {
      url: params.url,
      width: params.width ?? 1920,
      height: params.height ?? 1080,
      theme: params.theme ?? 'light',
      locale: params.locale,
    },
  });
}

export async function downloadWebToAiRecord(record: IWebToAiRecord, outputDir: string) {
  const files = [];
  for (const url of record.urls) {
    const res = await fetch(url);
    const content = await res.text();
    const fileName = `${path.basename(url)}.html`;
    const savePath = path.join(outputDir, fileName);
    writeFileSync(savePath, content, { encoding: 'utf-8' });
    files.push(savePath);
  }
  return files;
}

export const WebToAiCommand = new Command('web-to-ai')
  .description('Convert a website to an HTML snapshot for AI processing')
  .addOption(
    new Option('--width [width]', WEB_TO_AI_PARAMS_SCHEMA.shape.width.description).default(
      WEB_TO_AI_PARAMS_SCHEMA.shape.width.def.defaultValue,
    ),
  )
  .addOption(
    new Option('--height [height]', WEB_TO_AI_PARAMS_SCHEMA.shape.height.description).default(
      WEB_TO_AI_PARAMS_SCHEMA.shape.height.def.defaultValue,
    ),
  )
  .addOption(
    new Option('--theme [theme]', WEB_TO_AI_PARAMS_SCHEMA.shape.theme.description)
      .choices(['light', 'dark'])
      .default(WEB_TO_AI_PARAMS_SCHEMA.shape.theme.def.defaultValue),
  )
  .addOption(new Option('--locale [locale]', WEB_TO_AI_PARAMS_SCHEMA.shape.locale.description))
  .addOption(
    new Option('--output [output]', WEB_TO_AI_PARAMS_SCHEMA.shape.output.description).default(
      WEB_TO_AI_PARAMS_SCHEMA.shape.output.def.defaultValue,
    ),
  )
  .addArgument(new Argument('<url>', 'The URL of the website to convert'))
  .action(async (url: string, options: IWebToAiCommandOptions) => {
    const api = createCurrentCredentialAPI();

    if (!URL.canParse(url)) {
      throw new Error('Invalid URL, please provide a valid URL');
    }

    const response = await oraPromise(fetchWebToAiRecord(api, { url, ...options }), {
      text: 'Converting website to refore record...',
      successText: 'Website has been converted to refore record successfully',
      failText: (err: Error) => err.message,
    });

    consola.debug('Refore record ID: ', response.id);

    const outputDir = path.resolve(process.cwd(), options.output);
    mkdirSync(outputDir, { recursive: true });

    const files = await downloadWebToAiRecord(response, outputDir);

    consola.info(
      ['The website html file has been saved to the following location:', ...files.map((file) => `  - ${file}`)].join(
        '\n',
      ),
    );
  });
