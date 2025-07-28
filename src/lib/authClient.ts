import { createAuthClient } from 'better-auth/react';
import {
  adminClient,
  apiKeyClient,
  customSessionClient,
  organizationClient,
  usernameClient,
} from 'better-auth/client/plugins';
// import { auth } from '../auth';

 export const authClient = createAuthClient({
  // baseURL: '/',
  plugins: [
    customSessionClient(),
    apiKeyClient(),
    usernameClient(),
    organizationClient(),
  ],
});
export const {
  signIn,
  signUp,
  useSession,
  signOut,
  changePassword,
  organization,
  apiKey,
} = authClient
