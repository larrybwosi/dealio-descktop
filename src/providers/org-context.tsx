import { useEffect, useState } from 'react';
import { AlertCircle, Building2 } from 'lucide-react';
import { useOrgStore } from '@/lib/tanstack-axios';
import { useSession } from './session';
import { useNavigate } from 'react-router';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';

// Key for localStorage
const ORG_DETAILS_SET_KEY = 'orgDetailsSet';

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoading: isSessionLoading, isAuthenticated } = useSession();
  const router = useNavigate();
  const { organizationId, set: setOrgDetails } = useOrgStore();

  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'session' | 'organization' | 'complete'>('session');
  const [error, setError] = useState<string | null>(null);
  const [orgDetailsSet, setOrgDetailsSet] = useState<boolean | null>(null);

  // Check localStorage on initial render
  useEffect(() => {
    const storedValue = localStorage.getItem(ORG_DETAILS_SET_KEY);
    setOrgDetailsSet(storedValue === 'true');
  }, []);

  // Early return if org details are already set in localStorage
  // if (orgDetailsSet === true) {
  //   return null;
  // }

  // Early return if org details are already available in store
  useEffect(() => {
    if (organizationId) {
      localStorage.setItem(ORG_DETAILS_SET_KEY, 'true');
      setIsLoading(false);
      return;
    }
  }, [organizationId]);

  useEffect(() => {
    // Skip if we already have org details or orgDetailsSet is true
    if (organizationId || orgDetailsSet) return;

    const initializeOrg = async () => {
      try {
        // Wait for session to load
        if (isSessionLoading) {
          setLoadingStage('session');
          return;
        }

        if (session?.user?.id && isAuthenticated) {
          setLoadingStage('organization');

          // Fetch org details from the API
          const response = await api.get(`/api/org-details`);
          console.log(response);

          if (!response.data) {
            if (response.status === 404) {
              // User exists but has no org details
              router('/create-org');
              return;
            }
            throw new Error('Failed to fetch organization details');
          }

          const details = await response.data;

          if (details.organizationId) {
            // Set the fetched details in the Zustand store
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
            // Mark org details as set in localStorage
            localStorage.setItem(ORG_DETAILS_SET_KEY, 'true');
            setLoadingStage('complete');
            setIsLoading(false);
          } else {
            router('/create-org');
            return;
          }
        } else if (!isSessionLoading) {
          // No active session and not loading, redirect to login
          router('/login');
          return;
        }
      } catch (error) {
        console.error('Error initializing organization:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        // Show error for a moment before redirecting
        setTimeout(() => router('/login'), 3000);
      }
    };

    initializeOrg();
  }, [organizationId, session?.user?.id, isAuthenticated, isSessionLoading, orgDetailsSet]);

  // Early return if org is already loaded
  if (organizationId) {
    return <>{children}</>;
  }

  // Don't render anything if we're still determining orgDetailsSet state
  if (orgDetailsSet === null) {
    return null;
  }

  if (isLoading || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Main loader card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
            {error ? (
              <>
                {/* Error state */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Something went wrong</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                <div className="flex justify-center">
                  <Button onClick={() => router('/login')} className="px-6 py-2">
                    Go to Login
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Loading state */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {/* Smooth pulsing circle */}
                    <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center animate-pulse">
                      <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  {loadingStage === 'session'
                    ? 'Authenticating'
                    : loadingStage === 'organization'
                    ? 'Loading Organization'
                    : 'Preparing Workspace'}
                </h2>

                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  {loadingStage === 'session'
                    ? 'Verifying your credentials'
                    : loadingStage === 'organization'
                    ? 'Loading your organization settings'
                    : 'Almost there...'}
                </p>

                {/* Modern progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                  <div
                    className={`bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500 ease-out ${
                      loadingStage === 'session' ? 'w-1/3' : loadingStage === 'organization' ? 'w-2/3' : 'w-full'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Session</span>
                  <span>Organization</span>
                  <span>Complete</span>
                </div>
              </>
            )}
          </div>

          {/* Subtle background animation */}
          <div className="fixed inset-0 -z-10 overflow-hidden opacity-50">
            <div className="absolute top-1/4 -right-20 w-64 h-64 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
