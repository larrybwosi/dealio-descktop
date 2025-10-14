'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrgStore } from '@/lib/tanstack-axios';

const Loader = () => (
  <div className="fixed inset-0 bg-background z-50 overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
    </div>

    {/* Main Content */}
    <div className="relative h-full flex flex-col">
      {/* Header Skeleton */}
      <div className="p-6 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 border-r bg-background/50 backdrop-blur-sm p-6 hidden lg:block">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-6 border-t">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="p-6 border-b bg-background/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-32 rounded-md" />
                </div>
              </div>

              {/* Tabs or Navigation */}
              <div className="flex space-x-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-md" />
                ))}
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 p-6 bg-background/30">
            <div className="max-w-6xl mx-auto">
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-lg border p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-20 w-full rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Skeleton */}
              <div className="bg-card rounded-lg border">
                <div className="p-4 border-b">
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="divide-y">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center space-x-4">
                      <Skeleton className="h-4 w-4 rounded-sm" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <div className="flex-1" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Loading Indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-card border shadow-lg rounded-full px-6 py-3 flex items-center space-x-3">
          {/* Animated spinner */}
          <div className="relative">
            <div className="w-4 h-4 border-2 border-muted rounded-full animate-spin border-t-primary"></div>
          </div>

          {/* Loading text with animation */}
          <div className="text-sm font-medium text-foreground">
            Initializing application
            <span className="inline-flex ml-1">
              <span className="animate-pulse delay-0">.</span>
              <span className="animate-pulse delay-150">.</span>
              <span className="animate-pulse delay-300">.</span>
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-muted">
        <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }}></div>
      </div>
    </div>
  </div>
);

interface ZustandHydrationProps {
  children: React.ReactNode;
}

export const ZustandHydration = ({ children }: ZustandHydrationProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let orgHydrated = false;

    const checkHydration = () => {
      if (orgHydrated) {
        // Add a small delay for better UX
        setTimeout(() => {
          setIsHydrated(true);
        }, 300);
      }
    };

    // Set up Org store hydration listener
    const orgUnsub = useOrgStore.persist.onFinishHydration(() => {
      orgHydrated = true;
      checkHydration();
    });

    if (useOrgStore.persist.hasHydrated()) {
      orgHydrated = true;
    }

    // Initial check in case both are already hydrated
    checkHydration();

    return () => {
      orgUnsub?.();
    };
  }, []);

  return isHydrated ? children : <Loader />;
};
