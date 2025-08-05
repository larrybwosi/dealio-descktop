import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { useSession as useAuthSession } from '@/lib/authClient';
import { useNavigate } from 'react-router';
import LoadingSkeleton from '@/components/session-loader';

interface Session {
  user?: {
    id: string;
    email?: string;
    name?: string;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  token: string;
  expiresAt: number;
}

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'dealio-app_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds


// Alternative minimal skeleton for in-app loading
const MinimalLoadingSkeleton = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

interface SessionProviderProps {
  children: ReactNode;
  redirectTo?: string;
  loadingComponent?: ReactNode;
  useMinimalSkeleton?: boolean;
}

export function SessionProvider({
  children,
  redirectTo = '/login',
  loadingComponent,
}: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useNavigate();

  // Use ref to track if we've already processed the auth session
  const authSessionProcessed = useRef(false);
  const persistedSessionLoaded = useRef(false);

  // Call useAuthSession only once
  const { data: authSession, isPending: authLoading, error } = useAuthSession();

  // Load persisted session from localStorage
  const loadPersistedSession = (): Session | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;

      const parsedSession: Session = JSON.parse(stored);

      // Check if session has expired
      if (Date.now() > parsedSession.expiresAt) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      return parsedSession;
    } catch (error) {
      console.error('Error loading persisted session:', error);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  };

  // Persist session to localStorage
  const persistSession = (sessionData: Session) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error persisting session:', error);
    }
  };

  // Clear persisted session
  const clearPersistedSession = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  // Logout function
  const logout = () => {
    setSession(null);
    clearPersistedSession();
    authSessionProcessed.current = false; // Reset flag for potential re-login
    router(redirectTo);
  };

  // Refresh session function
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      // This would typically make an API call to refresh the session
      // For now, we'll rely on the auth client to handle this
      if (authSession) {
        const newSession: Session = {
          user: authSession.user!,
          token: authSession.session?.token,
          expiresAt: Date.now() + SESSION_DURATION,
        };
        setSession(newSession);
        persistSession(newSession);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Load persisted session on mount (only once)
  useEffect(() => {
    if (persistedSessionLoaded.current) return;

    persistedSessionLoaded.current = true;
    const persistedSession = loadPersistedSession();

    if (persistedSession) {
      setSession(persistedSession);
      setIsLoading(false);
      authSessionProcessed.current = true; // Mark as processed to avoid overriding
    }
  }, []);

  // Handle auth session only once when it's available and not processed yet
  useEffect(() => {
    // Skip if we've already processed auth session or if it's still loading
    if (authSessionProcessed.current || authLoading) return;

    authSessionProcessed.current = true;

    if (authSession) {
      // Only create new session if we don't already have a valid persisted one
      if (!session) {
        const newSession: Session = {
          user: authSession.user!,
          token: authSession.session.token,
          expiresAt: Date.now() + SESSION_DURATION,
        };
        setSession(newSession);
        persistSession(newSession);
      }
    } else if (error || !authSession) {
      // No valid session and no persisted session, redirect to login
      console.log(session);
      if (!session) {
        router(redirectTo);
      }
    }

    setIsLoading(false);
  }, [authSession, authLoading, error, session, router, redirectTo]);

  // Set up session expiry check
  useEffect(() => {
    if (!session) return;

    const checkExpiry = () => {
      if (session && Date.now() > session.expiresAt) {
        logout();
      }
    };

    // Check every minute
    const interval = setInterval(checkExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [session]);

  const contextValue: SessionContextType = {
    session,
    isLoading: isLoading || authLoading,
    isAuthenticated: !!session,
    logout,
    refreshSession,
  };

  // Show loading skeleton while session is being established
  if (isLoading || authLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return <LoadingSkeleton />;
  }

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
}

// Custom hook to use session context
export function useSession() {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }

  return context;
}

function NotAuthenticated() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-4">
        <div className="text-lg font-semibold">You are not authenticated</div>
        <div className="text-gray-500">Please log in to continue.</div>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => window.location.href = '/login'}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(Component: React.ComponentType<P>, redirectTo: string = '/login') {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useSession();
    const router = useNavigate();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router(redirectTo);
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return <MinimalLoadingSkeleton />;
    }

    if (!isAuthenticated) {
      return <NotAuthenticated />;
    }

    return <Component {...props} />;
  };
}
