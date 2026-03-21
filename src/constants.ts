import { ServerRegion } from './types';

export { version as VERSION, name as PACKAGE_NAME } from '../package.json';

export const API_CLIENT_NAME = 'uimap-cli';

export const IS_DEVELOPMENT = process.env.UIMAP_DEVELOPMENT === 'true';

// copy from enquirer type declaration
interface EnquirerChoice {
  name: string;
  message?: string;
  value?: unknown;
  hint?: string;
  role?: string;
  enabled?: boolean;
  disabled?: boolean | string;
}

const WORLD_CHOICE: EnquirerChoice = { name: ServerRegion.WORLD, message: 'World (uimap.ai)' };
const CHINA_CHOICE: EnquirerChoice = { name: ServerRegion.CHINA, message: 'China (uimap.reforeai.cn)' };
const CUSTOM_CHOICE: EnquirerChoice = { name: 'Custom' };

export const SERVER_CHOICES: EnquirerChoice[] = IS_DEVELOPMENT
  ? [WORLD_CHOICE, CHINA_CHOICE, CUSTOM_CHOICE]
  : [WORLD_CHOICE, CHINA_CHOICE];

export const OAUTH_CLIENT_ID = '30es759Yuw';
