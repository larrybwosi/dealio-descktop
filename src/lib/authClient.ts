import { createAuthClient } from 'better-auth/react';
import {
  apiKeyClient,
  customSessionClient,
  organizationClient,
  usernameClient,
} from 'better-auth/client/plugins';
import { API_ENDPOINT } from './axios';


 export const authClient = createAuthClient({
   // baseURL: API_ENDPOINT,
   plugins: [customSessionClient(), apiKeyClient(), usernameClient(), organizationClient()],
   fetchOptions: {
     onSuccess: ctx => {
      const jwt = ctx.response.headers.get('set-auth-jwt');
       // Store the token securely (e.g., in localStorage)
       if (jwt) {
         console.log('client token:', jwt);
         localStorage.setItem('jwt_token', jwt);
       }
     },
     auth: {
       type: 'Bearer',
       token: () => localStorage.getItem('bearer_token'), // get the token from localStorage
     },
   },
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
