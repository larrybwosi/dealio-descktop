import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router";
import { useOrgStore } from "@/lib/tanstack-axios";
import { useSession } from "@/lib/authClient";

// Types
interface SessionData {
  user: {
    id: string;
    email: string;
    name: string;
    // Add other user properties as needed
  };
  // Add other session properties as needed
}

interface OrgDetails {
  organizationId: string;
  memberId: string;
  locationId: string;
  locationName: string;
  address: string;
  logo: string;
  taxRate: number;
  currency: string;
  orgName: string;
  plan: string;
}

interface AppContextType {
  // Session state
  session: SessionData | null;
  sessionLoading: boolean;

  // Org state
  orgDetails: OrgDetails | null;
  orgLoading: boolean;

  // Combined loading state
  isInitializing: boolean;

  // Actions
  refreshSession: () => Promise<void>;
  refreshOrgDetails: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create contexts
const AppContext = createContext<AppContextType | undefined>(undefined);

// Enhanced Loader Component
const AppLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-md z-50">
    <div className="flex flex-col items-center space-y-8">
      {/* Multi-layered spinner */}
      <div className="relative">
        <div className="w-20 h-20 border-2 border-primary/20 rounded-full animate-spin">
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div
          className="absolute inset-2 w-16 h-16 border-2 border-primary/40 rounded-full animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "2s" }}
        >
          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-primary/80 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div
          className="absolute inset-4 w-12 h-12 border-3 border-primary/60 rounded-full animate-spin"
          style={{ animationDuration: "1.5s" }}
        >
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="absolute inset-6 w-8 h-8 bg-primary/20 rounded-full animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 bg-primary rounded-full animate-ping"></div>
        </div>

        <div className="absolute inset-0 w-20 h-20 bg-primary/10 rounded-full animate-pulse blur-sm"></div>
      </div>

      {/* Loading text */}
      <div className="text-center space-y-3">
        <div className="relative">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-pulse">
            Initializing
          </h3>
          <div className="absolute -right-6 top-0 flex space-x-0.5">
            <span
              className="animate-bounce text-primary"
              style={{ animationDelay: "0ms" }}
            >
              .
            </span>
            <span
              className="animate-bounce text-primary"
              style={{ animationDelay: "150ms" }}
            >
              .
            </span>
            <span
              className="animate-bounce text-primary"
              style={{ animationDelay: "300ms" }}
            >
              .
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground/80">
          Setting up your workspace
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative w-48 h-1 bg-muted/30 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full animate-pulse"></div>
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
          style={{
            width: "30%",
            animation: "slide 2s ease-in-out infinite",
          }}
        ></div>
      </div>
    </div>

  </div>
);

// Main App Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [orgDetails, setOrgDetails] = useState<OrgDetails | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Get org details from store
  const { organizationId: storeOrgDetails, set } = useOrgStore();

  // Session hook
  const { data: session, isPending: sessionLoading } = useSession();

  // Fetch organization details
  const fetchOrgDetails = async (): Promise<OrgDetails | null> => {
    try {
      setOrgLoading(true);
      const response = await fetch("/api/org-details", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const details = await response.json();

      const orgData: OrgDetails = {
        organizationId: details.organizationId,
        memberId: details.memberId,
        locationId: details.locationId,
        locationName: details.locationName,
        address: details.address,
        logo: details.logo,
        taxRate: details.taxRate,
        currency: details.currency,
        orgName: details.orgName,
        plan: details.plan,
      };

      setOrgDetails(orgData);

      // Update the store as well
      set(orgData);

      return orgData;
    } catch (error) {
      console.error("Failed to fetch org details:", error);
      return null;
    } finally {
      setOrgLoading(false);
    }
  };

  // Refresh functions
  const refreshSession = async () => {
    // This will trigger the useSession hook to refetch
    window.location.reload();
  };

  const refreshOrgDetails = async () => {
    await fetchOrgDetails();
  };

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear local state
      setOrgDetails(null);
      useOrgStore.getState().clear?.();

      // Navigate to login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force navigation even if logout request fails
      navigate("/login");
    }
  };

  // Main initialization effect
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsInitializing(true);

        // Skip initialization on login page
        if (location.pathname === "/login") {
          setIsInitializing(false);
          return;
        }

        // Wait for session to load
        if (sessionLoading) {
          return;
        }

        // Check session first
        if (!session) {
          navigate("/login");
          return;
        }

        // Check if org details are already available in store
        if (storeOrgDetails) {
          setOrgDetails(storeOrgDetails);
          setIsInitializing(false);
          return;
        }

        // Check local state
        if (orgDetails) {
          setIsInitializing(false);
          return;
        }

        // Fetch org details if not available
        const fetchedOrgDetails = await fetchOrgDetails();

        if (!fetchedOrgDetails) {
          console.warn("No organization details found");
          // Optionally redirect to an org setup page
          // navigate('/setup-organization');
        }
      } catch (error) {
        console.error("App initialization error:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [session, sessionLoading, location.pathname, storeOrgDetails]);

  // Context value
  const contextValue: AppContextType = {
    session,
    sessionLoading,
    orgDetails,
    orgLoading,
    isInitializing,
    refreshSession,
    refreshOrgDetails,
    logout,
  };

  // Show loader during initialization
  if (isInitializing) {
    return <AppLoader />;
  }

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// HOC for protected routes
interface ProtectedRouteProps {
  children: ReactNode;
  requireOrg?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOrg = true,
}) => {
  const { session, orgDetails, isInitializing } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitializing) return;

    if (!session) {
      navigate("/login");
      return;
    }

    if (requireOrg && !orgDetails) {
      console.warn("Organization details required but not available");
      // Optionally redirect to org setup
      // navigate('/setup-organization');
    }
  }, [session, orgDetails, isInitializing, requireOrg, navigate]);

  if (isInitializing) {
    return <AppLoader />;
  }

  if (!session) {
    return null;
  }

  if (requireOrg && !orgDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Organization Setup Required</h2>
          <p className="text-muted-foreground">
            Please complete your organization setup to continue.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Usage in your main App component:
/*
import { BrowserRouter } from 'react-router';
import { AppProvider, ProtectedRoute } from './AppProvider';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute requireOrg={false}>
                <Settings />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
*/
