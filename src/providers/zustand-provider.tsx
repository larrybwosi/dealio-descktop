"use client";

import { useOrgStore } from "@/lib/tanstack-axios";
import { useEffect, useState } from "react";

const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-md z-50">
    <div className="flex flex-col items-center space-y-8">
      {/* Enhanced spinner with multiple layers */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-20 h-20 border-2 border-primary/20 rounded-full animate-spin">
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Middle ring */}
        <div
          className="absolute inset-2 w-16 h-16 border-2 border-primary/40 rounded-full animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "2s" }}
        >
          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-primary/80 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Inner core */}
        <div
          className="absolute inset-4 w-12 h-12 border-3 border-primary/60 rounded-full animate-spin"
          style={{ animationDuration: "1.5s" }}
        >
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Center pulse */}
        <div className="absolute inset-6 w-8 h-8 bg-primary/20 rounded-full animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 bg-primary rounded-full animate-ping"></div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 w-20 h-20 bg-primary/10 rounded-full animate-pulse blur-sm"></div>
      </div>

      {/* Enhanced loading text with typing effect */}
      <div className="text-center space-y-3">
        <div className="relative">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-pulse">
            Loading
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
        <p className="text-sm text-muted-foreground/80 animate-fade-in">
          Initializing your workspace
        </p>
      </div>

      {/* Enhanced progress indicator */}
      <div className="relative w-48 h-1 bg-muted/30 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full animate-pulse"></div>
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-slide"
          style={{
            width: "30%",
            animation: "slide 2s ease-in-out infinite",
          }}
        ></div>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-float"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-primary/20 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-primary/40 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/3 w-2.5 h-2.5 bg-primary/25 rounded-full animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>
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
        // Add a small delay for smoother transition
        setTimeout(() => setIsHydrated(true), 300);
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

  return (
    <div
      className={`transition-opacity duration-500 ${
        isHydrated ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {!isHydrated && <Loader />}
      <div
        className={`transition-opacity duration-500 ${
          isHydrated ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};
