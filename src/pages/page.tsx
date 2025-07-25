'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff, Lock, Mail, Shield, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { signIn } from '@/lib/auth/authClient';
import { useRouter } from 'next/navigation';

type AuthStep = 'login' | 'forgot-password' | 'verify-otp' | 'reset-password';

interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface LoginFormData {
  identifier: string;
  password: string;
}

interface LoginOptions {
  loginWithEmail: (email: string, password: string, callbackUrl?: string) => Promise<void>;
  loginWithUsername: (username: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
}

const InputOTP = ({
  value,
  onChange,
  length = 6,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  className?: string;
}) => {
  const handleChange = (index: number, digit: string) => {
    const newValue = value.split('');
    newValue[index] = digit;
    onChange(newValue.join(''));

    // Auto-focus next input
    if (digit && index < length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className={`flex gap-2 justify-center ${className}`}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          id={`otp-${index}`}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          className="w-12 h-12 text-center text-lg font-semibold border border-input rounded-md bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      ))}
    </div>
  );
};

const LoginPage = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
  });
  const [resetData, setResetData] = useState<ResetPasswordData>({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const [signupUrl, setSignupUrl] = useState<string>('/signup');

  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle callback URL on client side
  useEffect(() => {
    const callbackUrl = searchParams.get('callbackUrl');
    console.log('Callback URL from searchParams:', callbackUrl);

    if (callbackUrl) {
      try {
        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        const newSignupUrl = `/signup?callbackUrl=${encodedCallbackUrl}`;
        console.log('Generated signup URL:', newSignupUrl);
        setSignupUrl(newSignupUrl);
      } catch (error) {
        console.error('Error encoding callback URL:', error);
        setSignupUrl('/signup');
      }
    } else {
      setSignupUrl('/signup');
    }
  }, [searchParams]);

  // Email validation regex
  const isEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Updated login functions with proper callback URL handling
  const loginOptions: LoginOptions = {
    loginWithEmail: async (email: string, password: string, callbackUrl?: string) => {
      await signIn.email({
        email,
        password,
        callbackURL: callbackUrl || '',
      });
    },
    loginWithUsername: async (username: string, password: string) => {
      console.log('Logging in with username:', username);
      await signIn.username({
        username,
        password,
        rememberMe: true,
      });
    },
    sendPasswordResetEmail: async (email: string) => {
      console.log('Sending password reset email to:', email);
      await new Promise(resolve => setTimeout(resolve, 1500));
    },
    verifyOTP: async (email: string, otp: string) => {
      console.log('Verifying OTP:', otp, 'for email:', email);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return otp === '123456';
    },
    resetPassword: async (email: string, otp: string, newPassword: string) => {
      console.log('Resetting password for:', email, otp, newPassword);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage({ type: null, text: '' });

    try {
      const { identifier, password } = formData;
      const callbackUrl = searchParams.get('callbackUrl');

      console.log('Attempting login with callback URL:', callbackUrl);

      if (isEmail(identifier)) {
        await loginOptions.loginWithEmail(identifier, password, callbackUrl || undefined);
      } else {
        await loginOptions.loginWithUsername(identifier, password);
      }

      // Handle redirect after successful login
      if (callbackUrl) {
        console.log('Redirecting to callback URL:', callbackUrl);
        router.push(callbackUrl);
      } else {
        console.log('No callback URL, redirecting to default');
        router.push('/dashboard'); // or your default route
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Login failed. Please check your credentials.' });
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetData.email) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: null, text: '' });

    try {
      await loginOptions.sendPasswordResetEmail(resetData.email);
      setOtpSent(true);
      setCurrentStep('verify-otp');
      setMessage({ type: 'success', text: 'OTP sent successfully! Check your email.' });
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      toast.error('Failed to send OTP. Please try again.', { description: error.message });
      setMessage({ type: 'error', text: 'Failed to send OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (resetData.otp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter the complete 6-digit OTP.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: null, text: '' });

    try {
      const isValid = await loginOptions.verifyOTP(resetData.email, resetData.otp);
      if (isValid) {
        setCurrentStep('reset-password');
        setMessage({ type: 'success', text: 'OTP verified successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Invalid OTP. Please try again.' });
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      setMessage({ type: 'error', text: 'OTP verification failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (resetData.newPassword !== resetData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (resetData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: null, text: '' });

    try {
      await loginOptions.resetPassword(resetData.email, resetData.otp, resetData.newPassword);
      setMessage({ type: 'success', text: 'Password reset successfully!' });
      setTimeout(() => {
        setCurrentStep('login');
        setResetData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
        setMessage({ type: null, text: '' });
      }, 2000);
    } catch (error: any) {
      toast.error('Password reset failed:', { description: error.message });
      setMessage({ type: 'error', text: 'Password reset failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'login':
        return 'Sign In';
      case 'forgot-password':
        return 'Reset Password';
      case 'verify-otp':
        return 'Verify OTP';
      case 'reset-password':
        return 'Create New Password';
      default:
        return 'Sign In';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'login':
        return 'Enter your email or username and password to access your account';
      case 'forgot-password':
        return "Enter your email address and we'll send you a verification code to reset your password";
      case 'verify-otp':
        return `We've sent a 6-digit verification code to ${resetData.email}. Enter it below to continue.`;
      case 'reset-password':
        return "Create a strong new password for your account. Make sure it's at least 8 characters long.";
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 50%, rgba(79, 70, 229, 0.9) 100%), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.1"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23a)"/></svg>')`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-8">
                <div className="w-24 h-24 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Lock className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
                <p className="text-xl opacity-90 max-w-md">
                  Sign in to your account and continue your journey with us.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>{getStepTitle()}</CardTitle>
                <CardDescription>{getStepDescription()}</CardDescription>
              </CardHeader>
              <CardContent>
                {message.text && (
                  <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
                    {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}

                {currentStep === 'login' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="identifier">Email or Username</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {isEmail(formData.identifier) ? (
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <Input
                          id="identifier"
                          name="identifier"
                          type="text"
                          placeholder="Enter your email or username"
                          value={formData.identifier}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          id="remember"
                          name="remember"
                          type="checkbox"
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <Label htmlFor="remember" className="text-sm">
                          Remember me
                        </Label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('forgot-password')}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button type="button" className="w-full" disabled={isLoading} onClick={handleSubmit}>
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing in...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Sign In
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </div>
                )}

                {/* Other form steps remain the same... */}
                {currentStep === 'forgot-password' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email Address</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="reset-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={resetData.email}
                          onChange={handleResetInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setCurrentStep('login')}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                      </Button>
                      <Button type="button" className="flex-1" disabled={isLoading} onClick={handleForgotPassword}>
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          'Send OTP'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'verify-otp' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <Shield className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <Label>Enter Verification Code</Label>
                        <p className="text-xs text-muted-foreground">
                          Didn&lsquo;t receive the code? Check your spam folder or
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-primary hover:underline ml-1"
                            disabled={isLoading}
                          >
                            resend it
                          </button>
                        </p>
                      </div>
                      <InputOTP
                        value={resetData.otp}
                        onChange={value => setResetData(prev => ({ ...prev, otp: value }))}
                        length={6}
                        className="justify-center"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setCurrentStep('forgot-password')}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        className="flex-1"
                        disabled={isLoading || resetData.otp.length !== 6}
                        onClick={handleVerifyOTP}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Verifying...
                          </div>
                        ) : (
                          'Verify OTP'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'reset-password' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            id="new-password"
                            name="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Create a new password"
                            value={resetData.newPassword}
                            onChange={handleResetInputChange}
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            id="confirm-password"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your new password"
                            value={resetData.confirmPassword}
                            onChange={handleResetInputChange}
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Password Requirements:</strong>
                        <br />• At least 8 characters long
                        <br />• Mix of uppercase and lowercase letters
                        <br />• Include numbers and special characters
                      </p>
                    </div>

                    <Button
                      type="button"
                      className="w-full"
                      disabled={isLoading || !resetData.newPassword || !resetData.confirmPassword}
                      onClick={handleResetPassword}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Resetting Password...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Reset Password
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </div>
                )}

                {currentStep === 'login' && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Don&lsquo;t have an account?{' '}
                      <a href={signupUrl} className="text-primary hover:underline font-medium">
                        Sign up
                      </a>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
