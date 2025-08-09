import { createAuthClient } from 'better-auth/react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiKeyClient, customSessionClient, organizationClient, usernameClient } from 'better-auth/client/plugins';
import { API_ENDPOINT } from './axios';
import { fetch } from '@tauri-apps/plugin-http';

export const authClient = createAuthClient({
  baseURL: API_ENDPOINT,
  plugins: [customSessionClient(), apiKeyClient(), usernameClient(), organizationClient()],
  fetchOptions: {
    onSuccess: ctx => {
      const jwt = ctx.response.headers.get('set-auth-jwt');
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
  disableDefaultFetchPlugins: true,
});
export const { signIn, signUp, changePassword, organization, apiKey } = authClient;
// 1. ========= TYPE DEFINITIONS =========

/**
 * A custom error class for fetch requests to include the HTTP status.
 */
export class BetterFetchError extends Error {
  status: number;
  info?: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = 'BetterFetchError';
    this.status = status;
    this.info = info;
  }
}

// Type for the User object
interface User {
  id: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  email?: string;
  image?: string;
  username?: string;
  displayUsername?: string;
}

// Type for the Session object
interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  activeOrganizationId?: string;
}

// The complete data structure returned by the API
export interface SessionData {
  user: User;
  session: Session;
}

// Options for the useSession hook
interface UseSessionOptions {
  /**
   * How long to persist the session data in the cache before it becomes stale.
   * Value is in milliseconds.
   * @default 3600000 (1 hour)
   */
  persistFor?: number;
  
  /**
   * Whether to enable the query. Useful for conditional fetching.
   * @default true
   */
  enabled?: boolean;
}

// The return type of the useSession hook
type UseSessionReturn = Omit<UseQueryResult<SessionData, BetterFetchError>, 'data' | 'error'> & {
  data: SessionData | undefined; // Ensure data can be undefined while loading
  error: BetterFetchError | null; // useQuery returns null for error when not present
};

// 2. ========= DATA FETCHER =========

/**
 * Fetches session data from the API endpoint.
 * It automatically parses date strings into Date objects.
 */
const getSession = async (): Promise<SessionData> => {
  const response = await fetch(`${API_ENDPOINT}/api/auth/get-session`, {
    // Add credentials to ensure cookies are sent
    credentials: 'include',
    // Add cache control headers
    headers: {
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) {
    let errorInfo: unknown;
    try {
      errorInfo = await response.json();
    } catch {
      errorInfo = { message: 'Failed to parse error response.' };
    }
    throw new BetterFetchError(`Failed to fetch session. Status: ${response.status}`, response.status, errorInfo);
  }

  const data = await response.json();

  // JSON doesn't support Date objects, so they are transmitted as strings.
  // We need to parse them back into Date objects for type safety.
  return {
    ...data,
    user: {
      ...data.user,
      createdAt: new Date(data.user.createdAt),
      updatedAt: new Date(data.user.updatedAt),
    },
    session: {
      ...data.session,
      expiresAt: new Date(data.session.expiresAt),
      createdAt: new Date(data.session.createdAt),
      updatedAt: new Date(data.session.updatedAt),
    },
  };
};

export function useSession(options?: UseSessionOptions): UseSessionReturn {
  const ONE_HOUR_IN_MS = 1000 * 60 * 60;
  const FIVE_MINUTES_IN_MS = 1000 * 60 * 5;

  const queryResult = useQuery<SessionData, BetterFetchError>({
    queryKey: ['session'],
    queryFn: getSession,
    staleTime: options?.persistFor ?? ONE_HOUR_IN_MS,
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    
    // CRITICAL FIX: Prevent excessive refetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Only refetch on mount, not on every render
    
    // Add retry configuration to prevent rapid retries
    retry: (failureCount, error) => {
      // Don't retry on 401/403 (authentication errors)
      if (error instanceof BetterFetchError && (error.status === 401 || error.status === 403)) {
        return false;
      }
      // Only retry up to 2 times with exponential backoff
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
    
    // Add network mode to prevent requests when offline
    networkMode: 'online',
    
    // Set a reasonable refetch interval (optional)
    refetchInterval: false, // Disable automatic refetching
    
    // Enable/disable the query based on options
    enabled: options?.enabled !== false,
    
    // Add error retry configuration
    retryOnMount: true,
    
    // Prevent background refetching unless explicitly needed
    refetchIntervalInBackground: false,
  });

  // Return all properties from useQuery, but override data and error types
  return {
    ...queryResult,
    data: queryResult.data,
    error: queryResult.error,
  };
}

/**
 * Signs out the user by calling the sign-out API endpoint.
 */
export const signOut = async (): Promise<void> => {
  const response = await fetch(`${API_ENDPOINT}/api/auth/sign-out`, {
    method: 'POST',
    credentials: 'include', // Ensure cookies are sent
  });

  if (!response.ok) {
    let errorInfo: unknown;
    try {
      errorInfo = await response.json();
    } catch {
      errorInfo = { message: 'Failed to parse error response.' };
    }
    throw new BetterFetchError(`Failed to sign out. Status: ${response.status}`, response.status, errorInfo);
  }
};