import type { FetchHooks, FetchOptions } from 'ofetch';
import { $fetch, ofetch } from 'ofetch';
import { SessionStore, CredentialStore, getSessionKey } from './config.js';
import type { ICredential } from '../types/index.js';
import { ServerRegion } from '../types/index.js';
import { API_CLIENT_NAME, VERSION } from '../constants.js';
import { jwtDecode } from 'jwt-decode';
import { Context } from './context.js';
import consola from 'consola';

const onResponse: FetchHooks['onResponse'] = (context) => {
  if (context.error) {
    return;
  }

  const data = context.response._data as any;

  if (!data || typeof data !== 'object') {
    // no data, let ofetch handle it
    return;
  }

  if (data.error) {
    context.error = data.error;
  } else if ('data' in data) {
    context.response._data = data.data;
  }
};

/** API base URL by server region or custom URL */
export function getAPIServerURL(server: ServerRegion | string): string {
  if (server === ServerRegion.WORLD) {
    return 'https://api.demoway.com';
  }
  if (server === ServerRegion.CHINA) {
    return 'https://api.demoway.cn';
  }
  return server;
}

export function getOAuthOrigin(server: ServerRegion | string) {
  if (server === ServerRegion.WORLD) {
    return 'https://uimap.ai';
  }
  if (server === ServerRegion.CHINA) {
    return 'https://uimap.reforeai.cn';
  }
  return server;
}

export class APIClient {
  constructor(public readonly credential: ICredential & { name?: string }) {}

  private getBaseURL(server: ServerRegion | string) {
    return getAPIServerURL(server);
  }

  private async refreshAuthToken() {
    const { apiKey, appId, server } = this.credential;
    const response = await ofetch<{ accessToken: string }>(`${this.getBaseURL(server)}/api/open-auth/token`, {
      method: 'POST',
      body: { apiKey, appId, scope: ['cli'] },
      onResponse,
    });
    const authKey = getSessionKey(this.credential);

    SessionStore.set(authKey, { accessToken: response.accessToken });

    return response.accessToken;
  }

  private async getAccessToken() {
    const authKey = getSessionKey(this.credential);
    const auth = SessionStore.get(authKey);

    if (auth) {
      const exp = jwtDecode(auth.accessToken).exp;
      // Consider it expired 60 seconds early to avoid expiration during request
      if (!exp || exp > Math.floor(Date.now() / 1000) + 60) {
        return auth.accessToken;
      }
    }

    const accessToken = await this.refreshAuthToken();

    return accessToken;
  }

  private getFetchOptions(): FetchOptions<'json'> {
    return {
      baseURL: this.getBaseURL(this.credential.server),
      onRequest: async (context) => {
        const accessToken = await this.getAccessToken();

        context.options.query = {
          ...context.options.query,
          client: API_CLIENT_NAME,
          version: VERSION,
          appId: this.credential.appId,
        };

        const headers = new Headers(context.options.headers);
        headers.set('Authorization', `Bearer ${accessToken}`);
        context.options.headers = headers;
      },
      onResponse,
    };
  }

  async validateCredentials() {
    try {
      await this.refreshAuthToken();
      return true;
    } catch (error) {
      consola.debug('validateCredentials error', error);
      return false;
    }
  }

  async fetch<T>(path: string, options?: FetchOptions<'json'>): Promise<T> {
    const data = await $fetch<T>(path, {
      ...this.getFetchOptions(),
      ...options,
    });
    return data;
  }
}

/** Public fetch for auth endpoints (no Authorization header) */
export function createPublicAuthFetch(server: ServerRegion | string) {
  const baseURL = getAPIServerURL(server);
  return $fetch.create({
    baseURL,
    onRequest: async (context) => {
      context.options.query = {
        ...context.options.query,
        client: API_CLIENT_NAME,
        version: VERSION,
      };
    },
    onResponse,
  });
}

export function createCurrentCredentialAPI() {
  const envCredential = {
    server: process.env.UIMAP_SERVER ?? ServerRegion.WORLD,
    apiKey: process.env.UIMAP_API_KEY,
    appId: process.env.UIMAP_APP_ID,
  };

  if (envCredential.server && envCredential.apiKey && envCredential.appId) {
    return new APIClient({
      server: envCredential.server,
      apiKey: envCredential.apiKey,
      appId: envCredential.appId,
    });
  }

  const credentialName = Context.credential ?? CredentialStore.get('default');

  if (!credentialName) {
    throw new Error('No available credential, please use "uimap login" to login first');
  }

  const credential = CredentialStore.get('credentials')?.[credentialName];
  if (!credential) {
    throw new Error(
      `Credential "${credentialName}" not exists, please specify a correct credential or use 'uimap credential add' to add a credential`,
    );
  }

  return new APIClient({
    server: credential.server,
    apiKey: credential.apiKey,
    appId: credential.appId,
  });
}
