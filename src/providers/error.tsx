import { Component, ReactNode, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertTriangle, RefreshCw, ChevronDown, Bug, Info } from 'lucide-react';

interface ErrorInfo {
  componentStack: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error details for debugging
    console.group('🚨 React Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error ID:', this.state.errorId);
    console.groupEnd();

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // const isDev = import.meta.env.DEV;
      const isDev = true;

      const { error, errorInfo, errorId } = this.state;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-destructive">Something went wrong</CardTitle>
              </div>
              <CardDescription>
                We apologize for the inconvenience. The application has encountered an unexpected error.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  {isDev ? (
                    <span className="font-mono text-sm">{error?.message || 'Unknown error occurred'}</span>
                  ) : (
                    'An unexpected error has occurred. Please try refreshing the page or contact support if the problem persists.'
                  )}
                </AlertDescription>
              </Alert>

              {isDev && error && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Developer Debug Information
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="space-y-3 p-3 bg-muted rounded-md">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Error ID:</h4>
                        <code className="text-xs bg-background p-1 rounded border">{errorId}</code>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-1">Error Message:</h4>
                        <code className="text-xs bg-background p-2 rounded border block whitespace-pre-wrap">
                          {error.message}
                        </code>
                      </div>

                      {error.stack && (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Stack Trace:</h4>
                          <code className="text-xs bg-background p-2 rounded border block whitespace-pre-wrap max-h-40 overflow-auto">
                            {error.stack}
                          </code>
                        </div>
                      )}

                      {errorInfo && (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Component Stack:</h4>
                          <code className="text-xs bg-background p-2 rounded border block whitespace-pre-wrap max-h-40 overflow-auto">
                            {errorInfo.componentStack}
                          </code>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                  Reload Application
                </Button>
              </div>

              {!isDev && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Error ID: <code className="text-xs">{errorId}</code>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Please include this ID when reporting the issue.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler for unhandled promise rejections and JS errors
const useGlobalErrorHandler = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.group('🚨 Global Error Handler');
      console.error('Unhandled Error:', event.error);
      console.error('Message:', event.message);
      console.error('Source:', event.filename);
      console.error('Line:', event.lineno);
      console.error('Column:', event.colno);
      console.groupEnd();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.group('🚨 Unhandled Promise Rejection');
      console.error('Reason:', event.reason);
      console.error('Promise:', event.promise);
      console.groupEnd();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
};

// Main Error Handler Provider component
interface ErrorHandlerProviderProps {
  children: ReactNode;
  customFallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export const ErrorHandlerProvider: React.FC<ErrorHandlerProviderProps> = ({ children, customFallback, onError }) => {
  useGlobalErrorHandler();

  return (
    <ErrorBoundary fallback={customFallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorHandlerProvider;
