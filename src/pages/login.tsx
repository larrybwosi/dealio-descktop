'use client';

import { useState, useEffect } from 'react';
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
  Shield,
  Users,
  KeyRound,
  CheckCircle,
  Quote,
} from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from '@/lib/authClient';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { fetch } from '@tauri-apps/plugin-http';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';
import axios, { AxiosInstance } from 'axios';
import { getApiKey, saveApiKey } from '@/lib/axios';

// Define Zod schemas for validation
const emailLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email or username is required')
    .refine(
      value => !value.includes('@') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      'Please enter a valid email address'
    ),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

const cardLoginSchema = z.object({
  employeeCard: z
    .string()
    .min(1, 'Employee card number is required')
    .regex(/^\d+$/, 'Card number must contain only digits')
    .min(8, 'Card number must be at least 8 digits'),
});

// Zod schema for the API Key form
const apiKeySchema = z.object({
  apiKey: z.string().min(10, 'API Key must be at least 10 characters long'),
});

type EmailLoginFormData = z.infer<typeof emailLoginSchema>;
type CardLoginFormData = z.infer<typeof cardLoginSchema>;
type ApiKeyFormData = z.infer<typeof apiKeySchema>;

interface LoginOptions {
  loginWithEmail: (
    email: string,
    password: string,
    callbackUrl?: string
  ) => Promise<{
    error?: { code?: string; message?: string; status: number; statusText: string };
    data?: { user?: { name: string } };
  }>;
  loginWithUsername: (
    username: string,
    password: string
  ) => Promise<{
    error?: { code?: string; message?: string; status: number; statusText: string };
    data?: { user?: { name: string } };
  }>;
  loginWithCard: (cardNumber: string) => Promise<{ error?: string; data?: { user?: { name: string } } }>;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'card' | 'apikey'>('email');
  const [generalError, setGeneralError] = useState('');

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    reset: resetEmailForm,
  } = useForm<EmailLoginFormData>({
    resolver: zodResolver(emailLoginSchema),
  });

  const {
    register: registerCard,
    handleSubmit: handleCardSubmit,
    formState: { errors: cardErrors },
    reset: resetCardForm,
  } = useForm<CardLoginFormData>({
    resolver: zodResolver(cardLoginSchema),
  });

  const {
    register: registerApiKey,
    handleSubmit: handleApiKeySubmit,
    setValue: setApiKeyFormValue,
    formState: { errors: apiKeyErrors },
  } = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
  });

  // On component mount, load the saved API key (if any) and populate the form
  useEffect(() => {
    const loadKey = async () => {
      const savedKey = await getApiKey();
      if (savedKey) {
        setApiKeyFormValue('apiKey', savedKey);
      }
    };
    loadKey();
  }, [setApiKeyFormValue]);

  const loginOptions: LoginOptions = {
    loginWithEmail: async (email, password, callbackUrl) => {
      const { error, data } = await signIn.email({
        email,
        password,
        callbackURL: callbackUrl || '/',
      });

      // const res = await fetch(`http://localhost:3000/api/auth/sign-in/email`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email, password }),
      // });
      // const res2 = await axios.post(`http://localhost:3000/api/auth/sign-in/email`, { email, password },{adapter: axiosTauriApiAdapter});

      // const response = await res.json();
      // console.log('Res2: ', res2.data)
      // console.log('Response' ,response)

      // if (res.status !== 200) {
      //   return { error: { code: res.status.toString(), message: ' Failed', status: res.status, statusText: res.statusText } };
      // }
      // const token = response.token || data.token;
      // if (token) {
      //   toast.success(token)
      //   localStorage.setItem('bearer_token', token);
      // }
      return { error, data };
    },
    loginWithUsername: async (username, password) => {
      const { error, data } = await signIn.username({
        username,
        password,
        rememberMe: true,
      });
      return { error, data };
    },
    loginWithCard: async cardNumber => {
      try {
        const response = await fetch('/api/login/card', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cardNumber }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Card verification failed');
        }

        return await response.json();
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Card verification failed',
        };
      }
    },
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'email' | 'card' | 'apikey');
    setGeneralError('');
  };

  const onEmailLogin = async (data: EmailLoginFormData) => {
    setIsLoading(true);
    setGeneralError('');

    try {
      let result;
      if (data.email.includes('@')) {
        result = await loginOptions.loginWithEmail(data.email, data.password, '/');
      } else {
        result = await loginOptions.loginWithUsername(data.email, data.password);
      }
      console.log('Login result:', result);
      // Add explicit checks
      if (!result) {
        toast.error('No response from authentication service');
        throw new Error('No response from authentication service');
      }

      if (result?.error) {
        toast.error(result.error.message || 'Login failed');
        throw new Error(result.error.message || 'Login failed');
      }
      const userName = result?.data?.user?.name || 'there';
      toast.success(`Login successful! Welcome back, ${userName}`);

      // Force a full page reload to ensure all session data is loaded
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
      handleLoginError(error, 'email');
    } finally {
      setIsLoading(false);
    }
  };

  const onCardLogin = async (data: CardLoginFormData) => {
    setIsLoading(true);
    setGeneralError('');

    try {
      const result = await loginOptions.loginWithCard(data.employeeCard);

      if (result?.error) {
        throw new Error(result.error);
      }

      const userName = result?.data?.user?.name || 'there';
      toast.success(`Login successful! Welcome back, ${userName}`);

      // Force a full page reload to ensure all session data is loaded
      window.location.href = '/';
    } catch (error) {
      console.error('Card login error:', error);
      handleLoginError(error, 'card');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for saving the API key to the Tauri store
  const onApiKeySubmit = async (data: ApiKeyFormData) => {
    setIsLoading(true);
    try {
      saveApiKey(data.apiKey); // Call the utility function to save the key
      toast.success('API Key saved securely!');
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to save API key:', error);
      toast.error('Could not save API Key.', {
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (error: unknown, loginType: 'email' | 'card') => {
    let errorMessage = 'Login failed. Please try again.';

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific error cases
      if (errorMessage.includes('invalid credentials') || errorMessage.includes('incorrect password')) {
        errorMessage = 'Invalid email/username or password';
      } else if (errorMessage.includes('user not found')) {
        errorMessage = 'Account not found. Please check your email/username';
      } else if (errorMessage.includes('card not found')) {
        errorMessage = 'Employee card not recognized';
      } else if (errorMessage.includes('inactive')) {
        errorMessage = 'Your account is inactive. Please contact support';
      }
    }

    toast.error(errorMessage);
    setGeneralError(errorMessage);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Image with overlay text - Redesigned for a more professional look */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 text-white overflow-hidden">
        {/* Subtle background pattern */}
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
              <span className="text-3xl font-bold tracking-wider">Dealio</span>
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
              <p className="text-lg italic text-gray-300">
                "Dealio has revolutionized our workflow. The insights we gain are invaluable, and the platform is
                incredibly intuitive."
              </p>
              <p className="mt-4 text-right font-semibold text-gray-200">- Jane Doe, CEO at Innovate Inc.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">Dealio</span>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-4 pb-6">
              <div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">Sign in to your account</CardTitle>
                <CardDescription className="text-center mt-2 text-gray-600">
                  Choose your preferred login method
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {generalError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                  {generalError}
                </div>
              )}

              <Tabs defaultValue="email" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="email" className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="card" className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </TabsTrigger>
                  <TabsTrigger value="apikey" className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4" />
                    <span>API Key</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                  <form onSubmit={handleEmailSubmit(onEmailLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email or Username
                      </Label>
                      <Input
                        id="email"
                        type="text"
                        placeholder="Enter your email or username"
                        className="h-11"
                        aria-invalid={!!emailErrors.email}
                        {...registerEmail('email')}
                      />
                      {emailErrors.email && <p className="text-sm text-red-600">{emailErrors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="h-11 pr-10"
                          aria-invalid={!!emailErrors.password}
                          {...registerEmail('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {emailErrors.password && <p className="text-sm text-red-600">{emailErrors.password.message}</p>}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                    >
                      {isLoading && activeTab === 'email' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4" />
                          <span>Sign In</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="card">
                  <form onSubmit={handleCardSubmit(onCardLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeCard" className="text-sm font-medium text-gray-700">
                        Employee Card Number
                      </Label>
                      <Input
                        id="employeeCard"
                        type="text"
                        placeholder="Enter your employee card number"
                        className="h-11"
                        aria-invalid={!!cardErrors.employeeCard}
                        {...registerCard('employeeCard')}
                      />
                      {cardErrors.employeeCard && (
                        <p className="text-sm text-red-600">{cardErrors.employeeCard.message}</p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <CreditCard className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Employee Card Login</p>
                          <p className="text-blue-600 mt-1">Use your physical employee card number for quick access</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                    >
                      {isLoading && activeTab === 'card' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4" />
                          <span>Verify Card</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* New Tab Content for API Key */}
                <TabsContent value="apikey">
                  <form onSubmit={handleApiKeySubmit(onApiKeySubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
                        Your Personal API Key
                      </Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Enter your API key"
                        className="h-11"
                        aria-invalid={!!apiKeyErrors.apiKey}
                        {...registerApiKey('apiKey')}
                      />
                      {apiKeyErrors.apiKey && <p className="text-sm text-red-600">{apiKeyErrors.apiKey.message}</p>}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <KeyRound className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">API Key Login</p>
                          <p className="text-yellow-700 mt-1">
                            Use this for CLI access or third-party integrations. Your key is stored securely on your
                            device.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium"
                    >
                      {isLoading && activeTab === 'apikey' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>Save Securely</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between text-sm">
                <button className="text-blue-600 hover:text-blue-800 font-medium">Forgot password?</button>
                <button className="text-gray-600 hover:text-gray-800">Need help?</button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <Badge variant="secondary" className="text-xs">
                    Secure Login
                  </Badge>
                  <span>•</span>
                  <span>Protected by enterprise security</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-500 mt-6">
            By signing in, you agree to our{' '}
            <button className="text-blue-600 hover:text-blue-800">Terms of Service</button> and{' '}
            <button className="text-blue-600 hover:text-blue-800">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
}
