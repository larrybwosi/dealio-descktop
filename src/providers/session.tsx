import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { useSession as useAuthSession } from '@/lib/authClient';
import { useNavigate } from 'react-router';
import LoadingSkeleton from '@/components/session-loader';

interface User {
  id: string;
  email?: string;
  name?: string;
  //eslint-disable-next-line
  [key: string]: any;
}

interface Session {
  user: User;
  expiresAt: number;
  refreshToken?: string;
}

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
  redirectTo?: string;
  loadingComponent?: ReactNode;
}

export function SessionProvider({
  children,
  redirectTo = '/login',
  loadingComponent,
}: SessionProviderProps) {
  // Call useAuthSession at the top level
  const { data: authSession, isPending: authLoading, error: authError } = useAuthSession();
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  
  // Add loading timeout to prevent infinite loading
  useEffect(() => {
    if (authLoading) {
      const timeoutId = setTimeout(() => {
        if (authLoading) {
          console.log('Auth loading timed out, redirecting to login');
          navigate(redirectTo);
        }
      }, 10000); // 10 seconds timeout
      return () => clearTimeout(timeoutId);
    }
  }, [authLoading, navigate, redirectTo]);

  const isAuthenticated = useMemo(() => !!session, [session]);

  const logout = useCallback(() => {
    setSession(null);
    navigate(redirectTo);
  }, [navigate, redirectTo]);

  const createSession = useCallback(
    //eslint-disable-next-line
    (authData: any): Session => ({
      user: authData.user,
      expiresAt: authData.expiresAt || Date.now() + 24 * 60 * 60 * 1000, // 24 hours default
      refreshToken: authData.refreshToken,
    }),
    []
  );

  useEffect(() => {
    if (authLoading) {
      console.log('Auth is loading...');
      return;
    }

    // console.log('Auth state:', { authSession, authError, isPending: authLoading });

    if (authSession?.user) {
      // console.log('User found in session:', authSession.user);
      const currentUserId = session?.user?.id;
      const newUserId = authSession.user.id;

      if (!session || currentUserId !== newUserId) {
        const newSession = createSession(authSession);
        console.log('Creating new session:', newSession);
        setSession(newSession);
      }
    } else if (authError) {
      console.log('Auth error detected:', authError);
      setSession(null);
      navigate(redirectTo);
    } else if (!authSession) {
      console.log('No auth session found, redirecting to login');
      setSession(null);
      navigate(redirectTo);
    }
  }, [authSession, authLoading, authError, session, navigate, redirectTo, createSession]);

  useEffect(() => {
    if (!session) return;

    const checkExpiry = () => {
      if (Date.now() >= session.expiresAt) {
        logout();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkExpiry();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(checkExpiry, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [session, logout]);

  const contextValue = useMemo<SessionContextType>(
    () => ({
      session,
      isLoading: authLoading,
      isAuthenticated,
      logout,
    }),
    [session, authLoading, isAuthenticated, logout]
  );

  // Only show loading state for initial authentication
  if (authLoading && !session) {
    console.log('Showing loading state - authenticating...');
    return loadingComponent ? <>{loadingComponent}</> : <LoadingSkeleton />;
  }

  // If we have a session or we're not loading, show the children
  console.log('Rendering provider with session:', !!session);
  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
}

// Custom hook with better error handling
export function useSession(): SessionContextType {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      'useSession must be used within a SessionProvider. ' +
        'Make sure to wrap your component tree with <SessionProvider>.'
    );
  }

  return context;
}

// Optimized NotAuthenticated component
function NotAuthenticated({ onRetry }: { onRetry?: () => void }) {
  const handleLoginClick = useCallback(() => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.href = '/login';
    }
  }, [onRetry]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-4 p-6">
        <div className="text-xl font-semibold text-gray-900">Authentication Required</div>
        <div className="text-gray-600 max-w-md">
          Your session has expired or you need to log in to access this content.
        </div>
        <button
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          onClick={handleLoginClick}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

// Optimized HOC with better TypeScript support
  //eslint-disable-next-line
export function withAuth<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  options: {
    redirectTo?: string;
    loadingComponent?: ReactNode;
    fallbackComponent?: ReactNode;
  } = {}
) {
  const { redirectTo = '/login', loadingComponent, fallbackComponent } = options;

  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useSession();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate(redirectTo);
      }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
      return loadingComponent ? <>{loadingComponent}</> : <LoadingSkeleton />;
    }

    if (!isAuthenticated) {
      return fallbackComponent ? <>{fallbackComponent}</> : <NotAuthenticated onRetry={() => navigate(redirectTo)} />;
    }

    return <Component {...props} />;
  };

  // Set display name for better debugging
  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return AuthenticatedComponent;
}