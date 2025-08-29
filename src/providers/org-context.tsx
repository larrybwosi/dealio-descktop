import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { useSession } from './session';
import { useOrgStore } from '@/lib/tanstack-axios';
import api from '@/lib/axios';

// Types
interface LoadingState {
  isLoading: boolean;
  stage: 'session' | 'organization' | 'complete' | 'error';
  error: string | null;
}

interface OrgContextType {
  loadingState: LoadingState;
  retry: () => void;
}

// Loading Component
const LoadingComponent: React.FC<{ stage: string }> = ({ stage }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
    {/* Animated background particles */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-10 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-10 blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-5 blur-3xl animate-pulse delay-500"></div>
    </div>

    <div className="relative max-w-md w-full mx-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center shadow-2xl">
        {/* Enhanced loading spinner */}
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto"></div>
          <div
            className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 mx-auto animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          ></div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          Setting up your workspace
        </h2>
        <p className="text-white/80 mb-6 text-lg">
          {stage === 'session' ? 'Verifying your session...' : 'Loading organization details...'}
        </p>

        {/* Enhanced progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: stage === 'session' ? '50%' : '90%' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  </div>
);

// Error Component
const ErrorComponent: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-red-900 via-rose-900 to-red-900 flex items-center justify-center z-50">
    {/* Animated background */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-r from-red-400 to-pink-400 opacity-10 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-10 blur-3xl animate-pulse delay-1000"></div>
    </div>

    <div className="relative max-w-md w-full mx-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center shadow-2xl">
        {/* Enhanced error icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-red-400/30 animate-ping"></div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
          Something went wrong
        </h2>
        <p className="text-white/80 mb-8 text-lg leading-relaxed">{error}</p>

        <div className="space-y-4">
          <button
            onClick={onRetry}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/30 shadow-lg"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try again
            </span>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/20 border border-white/20"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh page
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Context
const OrgContext = createContext<OrgContextType | undefined>(undefined);

// Provider Props
interface OrgProviderProps {
  children: ReactNode;
}

// Main Provider Component
export const OrgProvider: React.FC<OrgProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isLoading: isSessionLoading, session } = useSession();
  const { organizationId, set: setOrgDetails } = useOrgStore();

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    stage: 'session',
    error: null,
  });

  const fetchAndSetOrg = async () => {
    setLoadingState(prev => ({ ...prev, stage: 'organization', error: null, isLoading: true }));

    try {
      const { data: details } = await api.get(`/api/org-details`);

      if (details?.organizationId) {
        // API call was successful and returned organization details.
        // We update our global state.
        setOrgDetails({
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
        });

        // Save to localStorage for persistence
        localStorage.setItem(
          'org-details',
          JSON.stringify({
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
          })
        );

        // Mark loading as complete.
        setLoadingState({ isLoading: false, stage: 'complete', error: null });
      } else {
        // The user is authenticated but has no organization.
        // Redirect them to the creation page.
        navigate('/create-org');
      }
    } catch (error) {
      console.error('Error initializing organization:', error);

      // Check if the error is a 404, which means the user needs to create an org.
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        navigate('/create-org');
      } else {
        // For all other errors (network, server, etc.), show an error screen.
        const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
        setLoadingState({ isLoading: false, stage: 'error', error: message });
      }
    }
  };
  
  const retry = () => {
    if (!isSessionLoading && session) {
      fetchAndSetOrg();
    }
  };

  useEffect(() => {
    // If session is still loading, wait
    if (isSessionLoading) {
      setLoadingState(prev => ({ ...prev, stage: 'session', isLoading: true }));
      return;
    }

    // If no session, let the auth system handle it
    if (!session) {
      return;
    }

    // Priority check: Look for organizationId in localStorage first for immediate return
    const cachedOrgDetails = localStorage.getItem('org-details');
    if (cachedOrgDetails) {
      try {
        const parsedDetails = JSON.parse(cachedOrgDetails);
        if (parsedDetails.organizationId) {
          // Update the store with cached data
          setOrgDetails({
            organizationId: parsedDetails.organizationId,
            memberId: parsedDetails.memberId,
            locationId: parsedDetails.locationId,
            locationName: parsedDetails.locationName,
            address: parsedDetails.address,
            logo: parsedDetails.logo,
            taxRate: parsedDetails.taxRate,
            currency: parsedDetails.currency,
            orgName: parsedDetails.orgName,
            plan: parsedDetails.plan,
          });
          // Immediate return - no loading state needed
          setLoadingState({ isLoading: false, stage: 'complete', error: null });
          return;
        }
      } catch (error) {
        console.warn('Invalid cached org details, refetching...');
        localStorage.removeItem('org-details');
      }
    }

    // If we already have organizationId in store (from other sources)
    if (organizationId) {
      setLoadingState({ isLoading: false, stage: 'complete', error: null });
      return;
    }

    // Fetch organization details only if no cached data or org ID available
    fetchAndSetOrg();
  }, [isSessionLoading, session, organizationId]);

  // Show loading screen
  if (loadingState.isLoading && loadingState.stage !== 'error') {
    return <LoadingComponent stage={loadingState.stage} />;
  }

  // Show error screen
  if (loadingState.error) {
    return <ErrorComponent error={loadingState.error} onRetry={retry} />;
  }

  // Render children if everything is loaded
  return <OrgContext.Provider value={{ loadingState, retry }}>{children}</OrgContext.Provider>;
};

// Custom hook to use the org context
export const useOrgContext = (): OrgContextType => {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrgContext must be used within an OrgProvider');
  }
  return context;
};

// Export the context for advanced usage
export { OrgContext };
