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
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md w-full mx-4">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your workspace</h2>
        <p className="text-gray-600 mb-4">
          {stage === 'session' ? 'Verifying your session...' : 'Loading organization details...'}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: stage === 'session' ? '50%' : '90%' }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

// Error Component
const ErrorComponent: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md w-full mx-4">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Refresh page
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

    // Check if we already have org details in localStorage
    const cachedOrgDetails = localStorage.getItem('org-details');
    if (cachedOrgDetails && organizationId) {
      try {
        const parsedDetails = JSON.parse(cachedOrgDetails);
        if (parsedDetails.organizationId === organizationId) {
          // We have valid cached data, skip loading
          setLoadingState({ isLoading: false, stage: 'complete', error: null });
          return;
        }
      } catch (error) {
        console.warn('Invalid cached org details, refetching...');
        localStorage.removeItem('org-details');
      }
    }

    // If we have organizationId but no cached data, or cached data is invalid
    if (organizationId) {
      setLoadingState({ isLoading: false, stage: 'complete', error: null });
      return;
    }

    // Fetch organization details
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
