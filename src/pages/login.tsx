'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  CreditCard,
  Building2,
  ShieldAlert,
  KeyRound,
  CheckCircle,
  Quote,
  Loader2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';
import { API_ENDPOINT } from '@/lib/axios';
import { fetch } from '@tauri-apps/plugin-http';

// --- ZOD VALIDATION SCHEMAS ---
const emailLoginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const cardLoginSchema = z.object({
  employeeCard: z
    .string()
    .min(8, 'Card number must be at least 8 digits')
    .regex(/^\d+$/, 'Card number must contain only digits'),
});

const apiKeySchema = z.object({
  apiKey: z.string().min(20, 'API Key must be at least 20 characters long'),
});

// --- TYPE DEFINITIONS ---
type EmailLoginFormData = z.infer<typeof emailLoginSchema>;
type CardLoginFormData = z.infer<typeof cardLoginSchema>;
type ApiKeyFormData = z.infer<typeof apiKeySchema>;
type LoginMethod = 'email' | 'card' | 'apikey';

// --- API SERVICE (for better separation of concerns) ---
const authService = {
  loginWithEmail: async (data: EmailLoginFormData) => {
    const response = await axios.post(`${API_ENDPOINT}/api/auth/sign-in/email`, data, {
      adapter: axiosTauriApiAdapter,
    });
    
    return response.data;
  },
  loginWithCard: async (data: CardLoginFormData) => {
    // Replace with your actual card login API endpoint
    const response = await axios.post(`${API_ENDPOINT}/api/auth/sign-in/card`, data, {
      adapter: axiosTauriApiAdapter,
    });
    return response.data;
  },
  loginWithApiKey: async (data: ApiKeyFormData) => {
    // Replace with your actual API key login endpoint
    const response = await axios.post(`${API_ENDPOINT}/api/auth/sign-in/apikey`, data, {
      adapter: axiosTauriApiAdapter,
    });
    return response.data;
  },
};

/**
 * Left-side branding panel for the login page.
 */
const LoginBranding = () => (
  <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 text-white overflow-hidden">
    <div
      className="absolute inset-0 opacity-[.03]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
    />
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-900 to-black" />
    <div className="relative z-10 flex flex-col justify-between p-16">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold tracking-wider">Dealio POS</span>
        </div>
        <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">Unlock Your Business Potential.</h1>
        <p className="text-xl text-gray-300 mb-10 leading-relaxed">
          Access your dashboard to manage sales, track performance, and connect with your team seamlessly.
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-gray-300">Advanced Analytics & Reporting</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-gray-300">Real-time Collaboration Tools</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-gray-300">Enterprise-grade Security</span>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <div className="relative p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
          <Quote className="absolute top-4 left-4 w-8 h-8 text-gray-600" />
          <p className="text-lg italic text-gray-300 ml-6">
            "Dealio has revolutionized our workflow. The insights we gain are invaluable, and the platform is incredibly
            intuitive."
          </p>
          <p className="mt-4 text-right font-semibold text-gray-200">- Dean, CEO at Dealio Inc.</p>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Main login form container with tabs for different login methods.
 */
const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<LoginMethod>('email');
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm<EmailLoginFormData>({ resolver: zodResolver(emailLoginSchema) });
  const cardForm = useForm<CardLoginFormData>({ resolver: zodResolver(cardLoginSchema) });
  const apiKeyForm = useForm<ApiKeyFormData>({ resolver: zodResolver(apiKeySchema) });

  const handleLoginSuccess = async (data: { token: string; user?: { name: string } }) => {
    
    localStorage.setItem('bearer_token', data.token);
    const userName = data.user?.name || 'there';
    const res = await fetch(`${API_ENDPOINT}/api/auth/token`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    const resp = await res.json();
    
    const jwt = resp?.token || null;
    if (jwt) {
      console.log('JWT from login:', jwt);
      // Store JWT in localStorage for later use
      localStorage.setItem('jwt_token', jwt);
    }
    toast.success(`Login successful! Welcome back, ${userName}.`);
    setTimeout(() => {
      window.location.href = '/'; // Full reload to clear state and re-initialize app
    }, 1500);
  };

  const handleLoginError = (error: unknown) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    // **This is the key part for handling your specific error structure**
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      // We found a specific error message from the API response. Jane
      errorMessage = error.response.data.message;
    } else if (error instanceof Error) {
      // Fallback for other types of errors (network issues, etc.)
      errorMessage = error.message;
    }
    setGeneralError(errorMessage);
    toast.error('Login Failed', { description: errorMessage });
  };

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (data: any, method: LoginMethod) => {
    setIsLoading(true);
    setGeneralError('');
    try {
      let result;
      if (method === 'email') {
        result = await authService.loginWithEmail(data);
      } else if (method === 'card') {
        result = await authService.loginWithCard(data);
      } else {
        result = await authService.loginWithApiKey(data);
      }
      console.log('Login result:', result);
      handleLoginSuccess(result);
    } catch (error) {
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const SubmitButton = ({ method, text, loadingText }: { method: LoginMethod; text: string; loadingText: string }) => (
    <Button
      type="submit"
      disabled={isLoading}
      className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
    >
      {isLoading && activeTab === method ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  );

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Sign in to your Account</CardTitle>
            <CardDescription>Choose your preferred login method to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {generalError && (
              <div
                className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md flex items-start space-x-3"
                role="alert"
                aria-live="polite"
              >
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Login Error</p>
                  <p className="text-sm">{generalError}</p>
                </div>
              </div>
            )}
            <Tabs
              defaultValue="email"
              className="w-full"
              onValueChange={value => {
                setGeneralError('');
                setActiveTab(value as LoginMethod);
              }}
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="email">
                  <Mail className="w-4 h-4 mr-2" /> Email
                </TabsTrigger>
                <TabsTrigger value="card">
                  <CreditCard className="w-4 h-4 mr-2" /> Card
                </TabsTrigger>
                <TabsTrigger value="apikey">
                  <KeyRound className="w-4 h-4 mr-2" /> API Key
                </TabsTrigger>
              </TabsList>

              {/* Email/Username Login Form */}
              <TabsContent value="email">
                <form onSubmit={emailForm.handleSubmit(data => handleFormSubmit(data, 'email'))} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email or Username</Label>
                    <Input id="email" placeholder="you@example.com" {...emailForm.register('email')} />
                    {emailForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{emailForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...emailForm.register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {emailForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{emailForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <SubmitButton method="email" text="Sign In" loadingText="Signing In..." />
                </form>
              </TabsContent>

              {/* Card Login Form */}
              <TabsContent value="card">
                <form onSubmit={cardForm.handleSubmit(data => handleFormSubmit(data, 'card'))} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeCard">Employee Card Number</Label>
                    <Input id="employeeCard" placeholder="Enter card number" {...cardForm.register('employeeCard')} />
                    {cardForm.formState.errors.employeeCard && (
                      <p className="text-sm text-red-600">{cardForm.formState.errors.employeeCard.message}</p>
                    )}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p>Use your physical employee card number for quick, passwordless access.</p>
                  </div>
                  <SubmitButton method="card" text="Verify Card" loadingText="Verifying..." />
                </form>
              </TabsContent>

              {/* API Key Login Form */}
              <TabsContent value="apikey">
                <form
                  onSubmit={apiKeyForm.handleSubmit(data => handleFormSubmit(data, 'apikey'))}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input id="apiKey" placeholder="Enter your API key" {...apiKeyForm.register('apiKey')} />
                    {apiKeyForm.formState.errors.apiKey && (
                      <p className="text-sm text-red-600">{apiKeyForm.formState.errors.apiKey.message}</p>
                    )}
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 flex items-start space-x-2">
                    <ShieldAlert className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p>For developer and system integration use only. Handle with care.</p>
                  </div>
                  <SubmitButton method="apikey" text="Authenticate" loadingText="Authenticating..." />
                </form>
              </TabsContent>
            </Tabs>
            <div className="flex items-center justify-between text-sm">
              <button className="font-medium text-blue-600 hover:underline">Forgot password?</button>
              <button className="text-gray-600 hover:underline">Need help?</button>
            </div>
            <div className="pt-4 border-t border-gray-200 flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Badge variant="secondary">
                <Lock className="w-3 h-3 mr-1" /> Secure Login
              </Badge>
              <span>•</span>
              <span>Protected by enterprise security</span>
            </div>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <a href="#" className="font-medium text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="font-medium text-blue-600 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

/**
 * A wrapper to ensure the application is only viewed on larger screens.
 */
const DesktopOnlyView = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="hidden lg:flex min-h-screen w-full">{children}</div>
      <div className="lg:hidden flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gray-100">
        <Building2 className="w-16 h-16 text-blue-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Desktop Experience Recommended</h1>
        <p className="mt-2 text-gray-600">
          For the best experience, please access the Dealio POS on a desktop or laptop computer.
        </p>
      </div>
    </>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function LoginPage() {
  return (
    <DesktopOnlyView>
      <div className="min-h-screen flex bg-gray-50 w-full">
        <LoginBranding />
        <LoginForm />
      </div>
    </DesktopOnlyView>
  );
}
