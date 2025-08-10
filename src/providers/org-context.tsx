// OrgProvider.tsx

import { useEffect, useState, useRef } from 'react';
import { AlertCircle, Building2 } from 'lucide-react';
import { useOrgStore } from '@/lib/tanstack-axios';
import { useSession } from './session';
import { useNavigate } from 'react-router';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import axios from 'axios';

// --- Professional Loading State Component ---
// This component renders a multi-stage loading indicator.
const LoadingScreen = ({ stage }: { stage: string }) => {
  const stageConfig = {
    session: {
      title: 'Authenticating',
      message: 'Verifying your credentials...',
      progress: 'w-1/3',
    },
    organization: {
      title: 'Loading Organization',
      message: 'Fetching your organization details...',
      progress: 'w-2/3',
    },
    complete: {
      title: 'Preparing Workspace',
      message: 'Almost there...',
      progress: 'w-full',
    },
  };

  const currentStage = stageConfig[stage as keyof typeof stageConfig] || stageConfig.complete;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center animate-pulse">
                <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">{currentStage.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{currentStage.message}</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
            <div
              className={`bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500 ease-out ${currentStage.progress}`}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Session</span>
            <span>Organization</span>
            <span>Complete</span>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden opacity-50">
          <div className="absolute top-1/4 -right-20 w-64 h-64 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
        </div>
      </div>
    </div>
  );
};

// --- Professional Error State Component ---
// This component displays a clear error message with a working navigation button.
const ErrorScreen = ({ error, onNavigate }: { error: string; onNavigate: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-100 dark:from-slate-900 dark:to-red-900/50 flex items-center justify-center p-4">
    <div className="max-w-md w-full">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-red-200 dark:border-red-700/50 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">An Error Occurred</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 break-words">{error}</p>
        <Button
          onClick={onNavigate}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600"
        >
          Go to Login
        </Button>
      </div>
    </div>
  </div>
);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const { isLoading: isSessionLoading, isAuthenticated } = useSession();
  const navigate = useNavigate();
  const { organizationId, set: setOrgDetails } = useOrgStore();
  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    stage: 'session', 
    error: null as string | null,
  });

console.log(isAuthenticated);
  // This ref ensures the API call to fetch organization details is only made once.
  const initializationAttempted = useRef(false);

  useEffect(() => {
    if (isSessionLoading) {
      // The UI will show the 'session' loading stage.
      return;
    }

    // 2. Once session is loaded, check for authentication.
    // If the user is not authenticated, they must be redirected to login.
    if (!isAuthenticated) {
      navigate('/login');
      window.location.href='/login'
      return; // Stop further execution.
    }

    // 3. The user is authenticated. Check if the organization ID is already
    // available in our state (e.g., from Zustand's persisted state after rehydration).
    if (organizationId) {
      // If we have it, the setup is complete.
      setLoadingState({ isLoading: false, stage: 'complete', error: null });
      return;
    }

    // 4. If we've reached this point, the user is authenticated, but we don't have
    // an organization ID yet. We need to fetch it from the API.
    // We use a ref to ensure this API call is only made once per component mount.
    if (initializationAttempted.current) {
      return;
    }
    initializationAttempted.current = true;

    const fetchAndSetOrg = async () => {
      setLoadingState(prev => ({ ...prev, stage: 'organization' }));
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

    fetchAndSetOrg();
  }, [isSessionLoading, isAuthenticated, organizationId, navigate, setOrgDetails]);

  // --- Render Logic ---

  // If there's an error, show the dedicated error screen.
  // The navigation button will now work correctly.
  if (loadingState.error) {
    return <ErrorScreen error={loadingState.error} onNavigate={() => navigate('/login')} />;
  }

  // If we are still loading, show the staged loading screen.
  if (loadingState.isLoading) {
    return <LoadingScreen stage={loadingState.stage} />;
  }

  // Once loading is complete and successful, render the main application.
  return <>{children}</>;
}
