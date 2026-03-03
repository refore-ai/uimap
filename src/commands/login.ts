import { Command } from 'commander';
import open from 'open';
import { oraPromise } from 'ora';
import waitFor from 'p-wait-for';
import enquirer from 'enquirer';
import { createPublicAuthFetch, getAPIServerURL, CredentialStore, getOAuthOrigin } from '../lib/index.js';
import { OAUTH_CLIENT_ID } from '../constants.js';
import { ServerRegion } from '../types/enum.js';

interface OAuthResult {
  code: string;
  appId?: string;
}

export const LoginCommand = new Command('login').description('Login to UIMap via browser OAuth').action(async () => {
  const { serverRegion } = await enquirer.prompt<{ serverRegion: string }>({
    type: 'select',
    name: 'serverRegion',
    message: 'Select a server region:',
    choices: [ServerRegion.CHINA, ServerRegion.WORLD, 'Custom'],
  });

  let server: string;
  let oauthOrigin: string;

  if (serverRegion === 'Custom') {
    const loginCustomUrl = await enquirer.prompt<{ api: string; oauth: string }>([
      {
        type: 'input',
        name: 'api',
        message: 'Custom API URL:',
        validate: (value: string) => value.length > 0 || 'Custom API Server URL cannot be empty',
      },
      {
        type: 'input',
        name: 'oauth',
        message: 'Custom OAuth Origin:',
        validate: (value: string) => value.length > 0 || 'Custom OAuth Origin cannot be empty',
      },
    ]);
    server = loginCustomUrl.api;
    oauthOrigin = loginCustomUrl.oauth;
  } else {
    server = getAPIServerURL(serverRegion);
    oauthOrigin = getOAuthOrigin(serverRegion);
  }

  const $publicFetch = createPublicAuthFetch(server);

  const { readKey, writeKey } = await $publicFetch<{ readKey: string; writeKey: string }>('/api/auth/read-write-key', {
    method: 'POST',
  });

  const oauthURL = new URL('/oauth', oauthOrigin);
  oauthURL.searchParams.set('write_key', writeKey);
  oauthURL.searchParams.set('client_id', OAUTH_CLIENT_ID);

  await open(oauthURL.href);

  await oraPromise(
    async () => {
      const oauthResult = await waitFor(
        async () => {
          const result = await $publicFetch<null | OAuthResult>('/api/auth/oauth-by-read-key', {
            query: { key: readKey },
          });

          return result ? waitFor.resolveWith(result) : false;
        },
        { interval: 2000, timeout: 5 * 60 * 1000 },
      );

      const signedInResult = await $publicFetch<{
        accessToken: string;
        refreshToken: string;
        expires: number;
      }>('/api/auth/token', {
        method: 'POST',
        body: {
          code: oauthResult.code,
          grantType: 'AUTHORIZATION_CODE',
        },
      });

      const apiKey = await $publicFetch<{ key: string }>('/api/api-key/default', {
        headers: {
          Authorization: `Bearer ${signedInResult.accessToken}`,
        },
        query: {
          appId: oauthResult.appId,
        },
      });

      const credentialName = `__login`;
      CredentialStore.set(`credentials.${credentialName}`, {
        server,
        apiKey: apiKey.key,
        appId: oauthResult.appId,
      });
      CredentialStore.set('default', credentialName);
    },
    {
      text: `Waiting for you to complete login on ${oauthURL.href}`,
      successText: 'Login successful.',
      failText: () => `Login failed.`,
    },
  );
});
