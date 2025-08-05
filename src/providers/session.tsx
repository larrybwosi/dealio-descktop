import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { useSession as useAuthSession } from '@/lib/authClient';
import { useNavigate } from 'react-router';

interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
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

// Loading Skeleton Component
const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Header Skeleton */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-32"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-48"></div>
          </div>
        </div>

        {/* Card Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          {/* Form fields skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
          </div>

          {/* Button skeleton */}
          <div className="pt-2">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>

          {/* Social buttons skeleton */}
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
        </div>

        {/* Footer links skeleton */}
        <div className="text-center space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-40"></div>
          <div className="flex justify-center space-x-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
        </div>
      </div>

      {/* Floating loading indicator */}
      <div className="fixed bottom-6 right-6">
        <div className="flex items-center space-x-2 bg-white rounded-full shadow-lg px-4 py-2 border">
          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Loading...</span>
        </div>
      </div>
    </div>
  );
};

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
  useMinimalSkeleton = false,
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

    return useMinimalSkeleton ? <MinimalLoadingSkeleton /> : <LoadingSkeleton />;
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
      return null;
    }

    return <Component {...props} />;
  };
}
