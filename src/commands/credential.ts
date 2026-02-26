import { Command } from 'commander';
import { APIClient, CredentialStore } from '../lib/index.js';
import enquirer from 'enquirer';
import consola from 'consola';
import { oraPromise } from 'ora';
import { ServerRegion } from '../types/index.js';
import chalk from 'chalk';

async function promptNewCredential() {
  let { server } = await enquirer.prompt<{ server: string }>({
    type: 'select',
    name: 'server',
    message: 'Server:',
    choices: [ServerRegion.CHINA, ServerRegion.WORLD, 'Custom'],
  });

  if (server === 'Custom') {
    const { url: customServerURL } = await enquirer.prompt<{ url: string }>({
      type: 'input',
      name: 'url',
      message: 'Custom Server URL:',
      validate: (value: string) => value.length > 0 || 'Custom Server URL cannot be empty',
    });

    server = customServerURL;
  }

  const answers = await enquirer.prompt<{ apiKey: string; appId: string }>([
    {
      type: 'input',
      name: 'apiKey',
      message: 'API Key:',
      validate: (value: string) => value.length > 0 || 'API Key cannot be empty',
    },
    {
      type: 'input',
      name: 'appId',
      message: 'App ID:',
      validate: (value: string) => value.length > 0 || 'App ID cannot be empty',
    },
  ]);

  return {
    server,
    apiKey: answers.apiKey,
    appId: answers.appId,
  };
}

export const CredentialCommand = new Command('credential')
  .description('Manage authentication for Refore AI')
  .addCommand(
    new Command('add').description('Add a new Refore AI credential').action(async () => {
      const newCredential = await promptNewCredential();

      const api = new APIClient({
        server: newCredential.server,
        apiKey: newCredential.apiKey,
        appId: newCredential.appId,
      });

      await oraPromise(
        async () => {
          const credentials = CredentialStore.get('credentials');
          if (credentials) {
            for (const credentialName of Object.keys(credentials)) {
              const cred = credentials[credentialName];
              if (
                cred.server === newCredential.server &&
                cred.apiKey === newCredential.apiKey &&
                cred.appId === newCredential.appId
              ) {
                throw new Error('Credential already exists');
              }
            }
          }

          const success = await api.validateCredentials();
          if (!success) {
            throw new Error('Invalid credential, please check your API Key and App ID again.');
          }
        },
        {
          text: 'Validating credential...',
          successText: 'Login successful!',
          failText: (error: Error) => error.message,
        },
      );

      const profile = await api.fetch<{ nickName: string }>('/api/admin-user/profile/v2');
      const application = await api.fetch<{ name: string }>('/api/admin-user/application');

      const { credentialName } = await enquirer.prompt<{ credentialName: string }>({
        type: 'input',
        name: 'credentialName',
        message: 'Credential Name:',
        initial: `${profile.nickName}-${application.name}`,
        validate: (value: string) => value.length > 0 || 'Credential Name cannot be empty',
      });

      if (credentialName in (CredentialStore.get('credentials') ?? {})) {
        const { override } = await enquirer.prompt<{ override: boolean }>({
          type: 'confirm',
          name: 'override',
          message: 'Override existing credential?',
        });
        if (!override) {
          return;
        }
      }

      CredentialStore.set(`credentials.${credentialName}`, newCredential);

      if (CredentialStore.get('default')) {
        const { setAsDefault } = await enquirer.prompt<{ setAsDefault: boolean }>({
          type: 'confirm',
          name: 'setAsDefault',
          message: 'Set as default credential?',
          initial: true,
        });
        if (setAsDefault) {
          CredentialStore.set('default', credentialName);
        }
      } else {
        CredentialStore.set('default', credentialName);
      }
    }),
  )
  .addCommand(
    new Command('default').description('Set the default credential').action(async () => {
      const credentials = CredentialStore.get('credentials');
      if (!credentials) {
        consola.warn('No available credentials found, please add a credential first.');
        return;
      }

      const answer = await enquirer.prompt<{ credential: string }>({
        type: 'select',
        name: 'credential',
        message: 'Select a credential:',
        choices: Object.keys(credentials),
      });

      CredentialStore.set('default', answer.credential);
    }),
  )
  .addCommand(
    new Command('remove').description('Remove refore credentials').action(async () => {
      const credentials = CredentialStore.get('credentials');
      if (!credentials) {
        consola.warn('No available credentials found, please add a credential first.');
        return;
      }

      const { names } = await enquirer.prompt<{ names: string[] }>({
        type: 'multiselect',
        name: 'names',
        message: 'Select credentials to remove:',
        choices: Object.keys(credentials),
      });

      if (names.length === 0) {
        consola.warn('No credentials selected, operation cancelled');
        return;
      }

      for (const name of names) {
        CredentialStore.delete(`credentials.${name}`);
      }

      const defaultCredential = CredentialStore.get('default');
      if (defaultCredential && names.includes(defaultCredential)) {
        CredentialStore.delete('default');
      }
      consola.success('Credentials removed successfully');
      if (!CredentialStore.has('default')) {
        consola.warn('No default credential is set, please specify a new default credential.');
      }
    }),
  )
  .addCommand(
    new Command('list').description('View all refore credentials').action(() => {
      const credentials = CredentialStore.get('credentials');
      if (!credentials) {
        consola.warn(`You have no credentials, please add a credential first.`);
        return;
      }

      const count = Object.keys(credentials).length;
      consola.info(`You have ${count} credential${count > 1 ? 's' : ''}:\n`);
      const defaultCredential = CredentialStore.get('default');
      const names = Object.keys(credentials);
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const credential = credentials[name];
        consola.log(
          [
            `${i + 1}. ${name}${defaultCredential === name ? chalk.green(' (Default)') : ''}`,
            `   Server:   ${credential.server}`,
            `   API Key:  ${credential.apiKey.slice(0, 8)}******${credential.apiKey.slice(-4)}`,
            `   App ID:   ${credential.appId}`,
          ].join('\n'),
        );
      }
    }),
  );
