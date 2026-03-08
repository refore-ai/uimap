import { ServerRegion } from './types';

export { version as VERSION, name as PACKAGE_NAME } from '../package.json';

export const API_CLIENT_NAME = 'uimap-cli';

export const ENABLE_CUSTOM_SERVER = process.env.UIMAP_ENABLE_CUSTOM_SERVER === 'true';

export const SERVER_CHOICES = ENABLE_CUSTOM_SERVER
  ? [ServerRegion.WORLD, ServerRegion.CHINA, 'Custom']
  : [ServerRegion.WORLD, ServerRegion.CHINA];

export const OAUTH_CLIENT_ID = '30es759Yuw';
