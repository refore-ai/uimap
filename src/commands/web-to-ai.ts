import { Argument, Command, Option } from 'commander';
import { createCurrentAuthApi } from '../lib';
import consola from 'consola';
import { oraPromise } from 'ora';
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

interface IWebToAiOptions {
  width: number;
  height: number;
  theme: string;
  locale?: string;
  output: string;
}

export const WebToAiCommand = new Command('web-to-ai')
  .description('Convert a website to a refore record')
  .addOption(new Option('--width [width]', 'The width of the website').default(1920))
  .addOption(new Option('--height [height]', 'The height of the website').default(1080))
  .addOption(new Option('--theme [theme]', 'The theme of the website').choices(['light', 'dark']).default('light'))
  .addOption(
    new Option(
      '--locale [locale]',
      'The locale of the website (e.g. en-US, zh-CN), it will affect the language of the website content.',
    ),
  )
  .addOption(new Option('--output [output]', 'The output directory of the refore record').default('./'))
  .addArgument(new Argument('<url>', 'The URL of the website to convert'))
  .action(async (url: string, options: IWebToAiOptions) => {
    const api = createCurrentAuthApi();

    if (!URL.canParse(url)) {
      throw new Error('Invalid URL, please provide a valid URL');
    }

    const response = await oraPromise(
      api.fetch<{ id: string; urls: string[] }>('/api/web-to-ai/record-by-url', {
        method: 'POST',
        body: {
          url,
          width: options.width,
          height: options.height,
          theme: options.theme,
          locale: options.locale,
        },
      }),
      {
        text: 'Converting website to refore record...',
        successText: 'Website has been converted to refore record successfully',
        failText: (err: Error) => err.message,
      },
    );

    consola.debug('Refore record ID: ', response.id);

    const outputDir = path.resolve(process.cwd(), options.output);
    mkdirSync(outputDir, { recursive: true });

    const files = [];
    for (const url of response.urls) {
      const response = await fetch(url);
      const content = await response.text();
      const fileName = path.basename(url);
      const savePath = path.join(outputDir, fileName);
      writeFileSync(savePath, content, { encoding: 'utf-8' });
      files.push(savePath);
    }

    consola.info(
      ['The website html file has been saved to the following location:', ...files.map((file) => `  - ${file}`)].join(
        '\n',
      ),
    );
  });
