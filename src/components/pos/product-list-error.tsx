// components/products/product-list-error.tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

interface ProductListErrorProps {
  error: Error | null;
  onRetry: () => void;
  isRetrying: boolean;
}

export function ProductListError({ error, onRetry, isRetrying }: ProductListErrorProps) {
  const getErrorMessage = () => {
    if (!error) return 'An unexpected error occurred';

    // Common error patterns
    if (error?.message?.toLowerCase().includes('network') || error?.message?.toLowerCase().includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    if (error?.message?.toLowerCase().includes('timeout')) {
      return 'Request timed out. The server might be busy.';
    }
    if (error?.message?.toLowerCase().includes('404')) {
      return 'Products service not found. Please contact support.';
    }
    if (error?.message?.toLowerCase().includes('500')) {
      return 'Server error occurred. Please try again later.';
    }

    return error.message || 'Failed to load products';
  };

  const getErrorIcon = () => {
    if (!error) return <AlertTriangle className="h-5 w-5" />;

    if (error?.message?.toLowerCase().includes('network') || error?.message?.toLowerCase().includes('fetch')) {
      return <WifiOff className="h-5 w-5" />;
    }

    return <AlertTriangle className="h-5 w-5" />;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
      {/* Skeleton placeholders to maintain layout */}
      <div className="w-full max-w-2xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 opacity-20">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-32 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      <div className="w-full max-w-md z-10 -mt-32">
        <Alert variant="destructive" className="mb-4">
          <div className="flex items-center gap-2">
            {getErrorIcon()}
            <div className="flex-1">
              <AlertDescription className="text-sm">{getErrorMessage()}</AlertDescription>
            </div>
          </div>
        </Alert>

        <div className="flex flex-col gap-3 items-center">
          <Button onClick={onRetry} disabled={isRetrying} className="w-full" variant="outline">
            <RefreshCw className={cn('h-4 w-4 mr-2', isRetrying && 'animate-spin')} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            If the problem persists, please check your connection or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
