import type { FetchHooks, FetchOptions } from 'ofetch';
import { $fetch, ofetch } from 'ofetch';
import { SessionStore, CredentialStore, getSessionKey } from './config.js';
import type { ICredential } from '../types/index.js';
import { ServerRegion } from '../types/index.js';
import { VERSION } from '../constants.js';
import { jwtDecode } from 'jwt-decode';
import { Context } from './context.js';

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

export class APIClient {
  constructor(private readonly credential: ICredential) {}

  private getBaseURL(server: ServerRegion | string) {
    if (server === ServerRegion.WORLD) {
      return 'https://api.demoway.com';
    }

    if (server === ServerRegion.CHINA) {
      return 'https://api.demoway.cn';
    }

    return server;
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

        const headers = new Headers();
        context.options.query = {
          ...context.options.query,
          client: 'refore-cli',
          version: VERSION,
          appId: this.credential.appId,
        };

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

export function createCurrentAuthApi() {
  const credentialName = Context.credential ?? CredentialStore.get('default');

  if (!credentialName) {
    throw new Error('No specified credential, please use --credential to specify a credential');
  }

  const credential = CredentialStore.get('credentials')?.[credentialName];
  if (!credential) {
    throw new Error(
      `Credential "${credentialName}" not exists, please specify a correct credential or use 'refore credential add' to add a credential`,
    );
  }

  return new APIClient({
    server: credential.server,
    apiKey: credential.apiKey,
    appId: credential.appId,
  });
}
