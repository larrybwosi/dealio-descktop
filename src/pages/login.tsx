'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Mail, Lock, CreditCard, Building2, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from '@/lib/authClient';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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

type EmailLoginFormData = z.infer<typeof emailLoginSchema>;
type CardLoginFormData = z.infer<typeof cardLoginSchema>;

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
  loginWithCard: (cardNumber: string) => Promise<{ error?: string; data?: { user?: { name: string } }}>;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'card'>('email');
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

  const loginOptions: LoginOptions = {
    loginWithEmail: async (email, password, callbackUrl) => {
      const { error, data } = await signIn.email({
        email,
        password,
        callbackURL: callbackUrl || '/',
      });
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
    setActiveTab(value as 'email' | 'card');
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

      // Add explicit checks
      if (!result) {
        throw new Error('No response from authentication service');
      }

      if (result?.error) {
        throw new Error(result.error.message || 'Login failed');
      }
      const userName = result?.data?.user?.name || 'there';
      toast.success(`Login successful! Welcome back, ${userName}`);

      // Force a full page reload to ensure all session data is loaded
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
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
    <div className="min-h-screen flex">
      {/* Left side - Image with overlay text */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-black/20" />

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold">Dealio</span>
            </div>

            <h1 className="text-4xl font-bold mb-6 leading-tight">Welcome to the Future of Business Management</h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Streamline your operations, boost productivity, and unlock new opportunities with our comprehensive
              business platform.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-white/90">Advanced Analytics & Reporting</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-white/90">Real-time Collaboration Tools</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-white/90">Enterprise-grade Security</span>
              </div>
            </div>

            <div className="mt-12 flex items-center space-x-6 text-sm text-white/70">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>10,000+ Users</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                <span>SOC 2 Compliant</span>
              </div>
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
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="email" className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Email/Username</span>
                  </TabsTrigger>
                  <TabsTrigger value="card" className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Employee Card</span>
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
                      {isLoading ? (
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
                      {isLoading ? (
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