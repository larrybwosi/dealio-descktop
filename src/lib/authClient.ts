import { createAuthClient } from 'better-auth/react';
import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { apiKeyClient, customSessionClient, organizationClient, usernameClient } from 'better-auth/client/plugins';
import { API_ENDPOINT } from './axios';
import { fetch } from '@tauri-apps/plugin-http';
import axios, { AxiosError } from 'axios';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';

// ========= CONSTANTS =========
const SESSION_STORAGE_KEY = 'session_data_v1' as const;
const BEARER_TOKEN_KEY = 'bearer_token' as const;
const QUERY_KEY = ['session'] as const;

// Time constants
const TIME_CONSTANTS = {
  ONE_HOUR: 60 * 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  TWENTY_FOUR_HOURS: 24 * 60 * 60 * 1000,
  MAX_RETRY_DELAY: 30 * 1000,
} as const;

// ========= TYPE DEFINITIONS =========
export class BetterFetchError extends Error {
  readonly status: number;
  readonly info?: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = 'BetterFetchError';
    this.status = status;
    this.info = info;
  }
}

interface User {
  readonly id: string;
  readonly emailVerified: boolean;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly email?: string;
  readonly image?: string;
  readonly username?: string;
  readonly displayUsername?: string;
}

interface Session {
  readonly id: string;
  readonly userId: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly token: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly activeOrganizationId?: string;
}

export interface SessionData {
  readonly user: User;
  readonly session: Session;
}

interface UseSessionOptions {
  /**
   * How long to persist the session data in the cache before it becomes stale.
   * @default 3600000 (1 hour)
   */
  readonly persistFor?: number;

  /**
   * Whether to enable the query. Useful for conditional fetching.
   * @default true
   */
  readonly enabled?: boolean;

  /**
   * Custom refetch interval in milliseconds. Set to false to disable.
   * @default false
   */
  readonly refetchInterval?: number | false;
}

type UseSessionReturn = Omit<UseQueryResult<SessionData, BetterFetchError>, 'data' | 'error'> & {
  readonly data: SessionData | undefined;
  readonly error: BetterFetchError | null;
  readonly clearSession: () => void;
  readonly refreshSession: () => Promise<SessionData>;
};

interface StoredSessionData {
  readonly data: SessionData;
  readonly timestamp: number;
}

// ========= UTILITY FUNCTIONS =========
//eslint-disable-next-line
const parseStoredDates = (data: any): SessionData => ({
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
});

const getStoredSession = (): SessionData | null => {
  try {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedSession) return null;

    const parsed: StoredSessionData = JSON.parse(storedSession);
    const isValid = Date.now() - parsed.timestamp < TIME_CONSTANTS.TWENTY_FOUR_HOURS;

    if (!isValid) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return parseStoredDates(parsed.data);
  } catch (error) {
    console.warn('Failed to parse stored session:', error);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

const storeSession = (data: SessionData): void => {
  // console.log('Session storage set: ', data)
  try {
    const storedData: StoredSessionData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storedData));
    // localStorage.setItem(BEARER_TOKEN_KEY,data.session.token);
  } catch (error) {
    console.warn('Failed to store session data:', error);
  }
};

const clearStoredSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(BEARER_TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to clear stored session:', error);
  }
};

const isAuthError = (error: unknown): boolean => {
  return error instanceof BetterFetchError && (error.status === 401 || error.status === 403);
};

// ========= AUTH CLIENT CONFIGURATION =========
export const authClient = createAuthClient({
  baseURL: API_ENDPOINT,
  plugins: [customSessionClient(), apiKeyClient(), usernameClient(), organizationClient()],
  fetchOptions: {
    auth: {
      type: 'Bearer',
      token: () => localStorage.getItem(BEARER_TOKEN_KEY),
    },
    mode:'same-origin'
  },
  disableDefaultFetchPlugins: true,
});

export const { signIn, signUp, changePassword, organization, apiKey } = authClient;

// ========= SESSION FETCHER =========
const fetchSession = async (): Promise<SessionData> => {
  const response = await fetch(`${API_ENDPOINT}/api/auth/get-session`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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
  return parseStoredDates(data);
};

// ========= SESSION HOOK =========
export function useSession(options: UseSessionOptions = {}): UseSessionReturn {
  const queryClient = useQueryClient();

  const queryResult = useQuery<SessionData, BetterFetchError>({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<SessionData> => {
      // Try to get from localStorage first
      const storedSession = getStoredSession();
      if (storedSession) {
        // Check if session is valid and not near expiry
        if (isSessionValid(storedSession) && !isSessionNearExpiry(storedSession)) {
          return storedSession;
        }
        
        // If session is valid but near expiry, refresh it silently
        if (isSessionValid(storedSession) && isSessionNearExpiry(storedSession)) {
          try {
            console.log('Session near expiry, refreshing token...');
            const freshData = await fetchSession();
            storeSession(freshData);
            return freshData;
          } catch (error) {
            console.warn('Failed to refresh near-expiry token:', error);
            // Fall back to the stored session if refresh fails
            return storedSession;
          }
        }
        
        // If session is invalid (expired), clear it and fetch a new one
        clearStoredSession();
      }

      // Fetch from API and store
      const freshData = await fetchSession();
      storeSession(freshData);
      return freshData;
    },

    // Cache configuration
    staleTime: options.persistFor ?? TIME_CONSTANTS.ONE_HOUR,
    gcTime: TIME_CONSTANTS.TWENTY_FOUR_HOURS,

    // Prevent excessive refetching
    refetchOnWindowFocus: true, // Enable to catch expired sessions when user returns
    refetchOnReconnect: true, // Enable to refresh token when reconnecting
    refetchOnMount: true,
    // Set default refetchInterval to check for token expiry
    refetchInterval: options.refetchInterval ?? TIME_CONSTANTS.FIVE_MINUTES,
    refetchIntervalInBackground: true,

    // Retry configuration
    retry: (failureCount, error) => {
      if (isAuthError(error)) {
        clearStoredSession();
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * Math.pow(2, attemptIndex), TIME_CONSTANTS.MAX_RETRY_DELAY),

    // Other options
    networkMode: 'online',
    enabled: options.enabled !== false,
  });

  // Helper functions
  const clearSession = (): void => {
    clearStoredSession();
    queryClient.removeQueries({ queryKey: QUERY_KEY });
    queryClient.clear();
  };

  const refreshSession = async (): Promise<SessionData> => {
    clearStoredSession();
    const freshData = await queryClient.fetchQuery({
      queryKey: QUERY_KEY,
      queryFn: fetchSession,
      staleTime: 0, // Force fresh fetch
    });
    storeSession(freshData);
    return freshData;
  };

  return {
    ...queryResult,
    data: queryResult.data,
    error: queryResult.error,
    clearSession,
    refreshSession,
  };
}

// ========= SIGN OUT FUNCTION =========
export const signOut = async (): Promise<void> => {
  try {
    const token = localStorage.getItem(BEARER_TOKEN_KEY);

    await axios.post(
      `${API_ENDPOINT}/api/auth/sign-out`,
      {},
      {
        withCredentials: true,
        adapter: axiosTauriApiAdapter,
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorInfo = error.response?.data || { message: 'Failed to parse error response.' };
      throw new BetterFetchError(
        `Failed to sign out. Status: ${error.response?.status || 'unknown'}`,
        error.response?.status || 0,
        errorInfo
      );
    }
    throw error;
  } finally {
    // Always clear session data, even if the API call fails
    clearStoredSession();
  }
};

// ========= ADDITIONAL UTILITIES =========

/**
 * Check if the current session is valid (not expired)
 */
export const isSessionValid = (sessionData?: SessionData): boolean => {
  if (!sessionData?.session?.expiresAt) return false;
  return new Date(sessionData.session.expiresAt) > new Date();
};

/**
 * Get session expiry time in milliseconds from now
 */
export const getSessionTimeToExpiry = (sessionData?: SessionData): number => {
  if (!sessionData?.session?.expiresAt) return 0;
  return Math.max(0, new Date(sessionData.session.expiresAt).getTime() - Date.now());
};

/**
 * Check if session will expire within the given time (in milliseconds)
 */
export const isSessionNearExpiry = (
  sessionData?: SessionData,
  withinMs: number = TIME_CONSTANTS.FIVE_MINUTES
): boolean => {
  return getSessionTimeToExpiry(sessionData) < withinMs;
};

/**
 * Auto-refresh middleware for axios requests
 * This can be used to automatically refresh tokens when making API calls
 */
export const createAuthRefreshInterceptor = (axiosInstance: typeof axios) => {
  let isRefreshing = false;
  let refreshPromise: Promise<SessionData> | null = null;
  const pendingRequests: Array<() => void> = [];

  // Function to process pending requests after token refresh
  const processPendingRequests = () => {
    pendingRequests.forEach(callback => callback());
    pendingRequests.length = 0;
  };

  // Response interceptor to catch auth errors
  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      // If error is not auth-related or request has already been retried, reject
      if (!isAuthError(error) || originalRequest._retry) {
        return Promise.reject(error);
      }
      
      // Mark request as retried to prevent infinite loops
      originalRequest._retry = true;
      
      // If not already refreshing, start refresh process
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          // Use existing refresh promise or create a new one
          refreshPromise = refreshPromise || fetchSession().then(data => {
            storeSession(data);
            return data;
          });
          
          // Wait for token refresh
          await refreshPromise;
          
          // Process all pending requests
          processPendingRequests();
          
          // Update authorization header with new token
          const token = localStorage.getItem(BEARER_TOKEN_KEY);
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          // Retry the original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear session and reject
          clearStoredSession();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      } else {
        // If already refreshing, queue this request
        return new Promise(resolve => {
          pendingRequests.push(() => {
            // Update authorization header with new token
            const token = localStorage.getItem(BEARER_TOKEN_KEY);
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axiosInstance(originalRequest));
          });
        });
      }
    }
  );

  return axiosInstance;
};
