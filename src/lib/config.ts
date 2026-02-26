import type { Options } from 'conf';
import Conf from 'conf';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { SessionConfig, ICredential, CredentialConfig } from '../types/index.js';
import { version as VERSION } from '../../package.json';

const CONFIG_DIR = join(homedir(), '.refore-ai');

const BASE_CONFIG: Options<any> = {
  cwd: CONFIG_DIR,
  projectVersion: VERSION,
};

// Session storage for authentication, supports multiple credentials: apiKey -> appId -> AuthCredentials
export const SessionStore = new Conf<SessionConfig>({
  ...BASE_CONFIG,
  configName: 'session',
});

export function getSessionKey(credential: ICredential): string {
  return `${credential.server}|${credential.apiKey}|${credential.appId}`;
}

// General configuration storage
export const CredentialStore = new Conf<CredentialConfig>({
  ...BASE_CONFIG,
  configName: 'credential',
});
