'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Building2 } from 'lucide-react';
import { useOrgStore } from '@/lib/tanstack-axios';
import { useSession } from '@/lib/authClient';
import { useNavigate } from 'react-router';

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useNavigate();
  const { organizationId, set: setOrgDetails } = useOrgStore();

  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'session' | 'organization' | 'complete'>('session');
  const [error, setError] = useState<string | null>(null);
  console.log('OrgProvider initialized with organizationId:', organizationId);

  useEffect(() => {
    const initializeOrg = async () => {
      try {
        // 1. Check if org details are already in the Zustand store (and persisted storage)
        if (organizationId) {
          setLoadingStage('complete');
          setIsLoading(false);
          return;
        }

        // 2. If not in store, check the user's session status
        if (isPending) {
          setLoadingStage('session');
          return;
        }

        if (session?.user?.id) {
          setLoadingStage('organization');

          // 3. Session is authenticated, fetch org details from the API
          const response = await fetch('/api/org-details');
          if (!response.ok) {
            if (response.status === 404) {
              // User exists but has no org details
              router('/login');
              return;
            }
            throw new Error('Failed to fetch organization details');
          }

          const details = await response.json();

          if (details.organizationId) {
            // 4. Set the fetched details in the Zustand store
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
            setLoadingStage('complete');
          } else {
            router('/create-org');
            return;
          }
        } else {
          // 5. No active session, redirect to the login page
          router('/login');
          return;
        }
      } catch (error) {
        console.error('Error initializing organization:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        // Optional: Show error for a moment before redirecting
        setTimeout(() => router('/login'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    initializeOrg();
  }, [organizationId, session, isPending, router, setOrgDetails]);

  if (isLoading || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Main loader card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
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
                <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">Redirecting to login...</p>
              </>
            ) : (
              <>
                {/* Loading state */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {/* Outer spinning ring */}
                    <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                    {/* Inner icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {loadingStage === 'session'
                    ? 'Authenticating...'
                    : loadingStage === 'organization'
                      ? 'Loading Organization...'
                      : 'Initializing...'}
                </h2>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {loadingStage === 'session'
                    ? 'Verifying your session'
                    : loadingStage === 'organization'
                      ? 'Fetching organization details'
                      : 'Setting up your workspace'}
                </p>

                {/* Progress indicators */}
                <div className="flex justify-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      loadingStage === 'session'
                        ? 'bg-blue-600 dark:bg-blue-400 animate-pulse'
                        : loadingStage === 'organization' || loadingStage === 'complete'
                          ? 'bg-blue-600 dark:bg-blue-400'
                          : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                  <div
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      loadingStage === 'organization'
                        ? 'bg-blue-600 dark:bg-blue-400 animate-pulse'
                        : loadingStage === 'complete'
                          ? 'bg-blue-600 dark:bg-blue-400'
                          : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                  <div
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      loadingStage === 'complete'
                        ? 'bg-blue-600 dark:bg-blue-400 animate-pulse'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                </div>
              </>
            )}
          </div>

          {/* Subtle background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
