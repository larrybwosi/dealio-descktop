import { createAuthClient } from 'better-auth/react';
import { apiKeyClient, organizationClient, usernameClient } from 'better-auth/client/plugins';
import { API_ENDPOINT } from './axios';

export const { signIn, signUp, useSession, signOut, changePassword, apiKey } = createAuthClient({
  baseURL: API_ENDPOINT,
  plugins: [apiKeyClient(), usernameClient(), organizationClient()],
  fetchOptions: {
    credentials: 'include',
  },
});

//For the betterauth plugin
export const authClient = createAuthClient({
  baseURL: API_ENDPOINT,
  plugins: [apiKeyClient(), usernameClient(), organizationClient()],
  fetchOptions: {
    credentials: 'include',
  },
});
