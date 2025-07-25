"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  CreditCard,
  Building2,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/lib/authClient";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/providers/session";

interface LoginOptions {
  loginWithEmail: (
    email: string,
    password: string,
    callbackUrl?: string
  ) => Promise<{ error?: string }>;
  loginWithUsername: (
    username: string,
    password: string
  ) => Promise<{ error?: string }>;
  loginWithCard: (cardNumber: string) => Promise<{ error?: string }>;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "card">("email");
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    employeeCard: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    employeeCard: "",
    general: "",
  });
const router = useNavigate()
const session = useSession()
console.log(session)
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInputs = (loginType: "email" | "card"): boolean => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
      employeeCard: "",
      general: "",
    };

    if (loginType === "email") {
      if (!credentials.email) {
        newErrors.email = "Email or username is required";
        isValid = false;
      } else if (
        credentials.email.includes("@") &&
        !validateEmail(credentials.email)
      ) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      }

      if (!credentials.password) {
        newErrors.password = "Password is required";
        isValid = false;
      } else if (credentials.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
        isValid = false;
      }
    } else {
      if (!credentials.employeeCard) {
        newErrors.employeeCard = "Employee card number is required";
        isValid = false;
      } else if (!/^\d+$/.test(credentials.employeeCard)) {
        newErrors.employeeCard = "Card number must contain only digits";
        isValid = false;
      } else if (credentials.employeeCard.length < 8) {
        newErrors.employeeCard = "Card number must be at least 8 digits";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const loginOptions: LoginOptions = {
    loginWithEmail: async (email, password, callbackUrl) => {
      const { error } = await signIn.email({
        email,
        password,
        callbackURL: callbackUrl || "",
      });
      return { error };
    },
    loginWithUsername: async (username, password) => {
      const { error } = await signIn.username({
        username,
        password,
        rememberMe: true,
      });
      return { error };
    },
    loginWithCard: async (cardNumber) => {
      try {
        const response = await fetch("/api/login/card", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cardNumber }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Card verification failed");
        }

        return await response.json();
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Card verification failed",
        };
      }
    },
  };

  const handleLogin = async (loginType: "email" | "card") => {
    // Clear previous errors
    setErrors({
      email: "",
      password: "",
      employeeCard: "",
      general: "",
    });

    // Validate inputs
    if (!validateInputs(loginType)) {
      return;
    }

    setIsLoading(true);

    try {
      if (loginType === "email") {
        let result;
        if (validateEmail(credentials.email)) {
          result = await loginOptions.loginWithEmail(
            credentials.email,
            credentials.password
          );
        } else {
          result = await loginOptions.loginWithUsername(
            credentials.email,
            credentials.password
          );
        }

        if (result?.error) {
          throw new Error(result.error);
        }

        toast.success("Login successful! Welcome to Dealio");
        router("/");
      } else {
        const result = await loginOptions.loginWithCard(
          credentials.employeeCard
        );

        if (result?.error) {
          throw new Error(result.error);
        }

        toast.success("Employee card verified! Welcome back");
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific error cases
        if (
          errorMessage.includes("invalid credentials") ||
          errorMessage.includes("incorrect password")
        ) {
          errorMessage = "Invalid email/username or password";
          setErrors((prev) => ({
            ...prev,
            email: "Invalid credentials",
            password: "Invalid credentials",
          }));
        } else if (errorMessage.includes("user not found")) {
          errorMessage = "Account not found. Please check your email/username";
          setErrors((prev) => ({
            ...prev,
            email: "Account not found",
          }));
        } else if (errorMessage.includes("card not found")) {
          errorMessage = "Employee card not recognized";
          setErrors((prev) => ({
            ...prev,
            employeeCard: "Card not recognized",
          }));
        } else if (errorMessage.includes("inactive")) {
          errorMessage = "Your account is inactive. Please contact support";
        }
      }

      toast.error(errorMessage);
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image with overlay text */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-blue-600 via-purple-600 to-indigo-800">
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

            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Welcome to the Future of Business Management
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Streamline your operations, boost productivity, and unlock new
              opportunities with our comprehensive business platform.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-white/90">
                  Advanced Analytics & Reporting
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-white/90">
                  Real-time Collaboration Tools
                </span>
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
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">Dealio</span>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-4 pb-6">
              <div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Sign in to your account
                </CardTitle>
                <CardDescription className="text-center mt-2 text-gray-600">
                  Choose your preferred login method
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                  {errors.general}
                </div>
              )}

              <Tabs
                defaultValue="email"
                className="w-full"
                onValueChange={(value) =>
                  setActiveTab(value as "email" | "card")
                }
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="email"
                    className="flex items-center space-x-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email/Username</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="card"
                    className="flex items-center space-x-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Employee Card</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email or Username
                    </Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter your email or username"
                      value={credentials.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="h-11"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className="h-11 pr-10"
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleLogin("email")}
                    disabled={isLoading}
                    className="w-full h-11 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
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
                </TabsContent>

                <TabsContent value="card" className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="employeeCard"
                      className="text-sm font-medium text-gray-700"
                    >
                      Employee Card Number
                    </Label>
                    <Input
                      id="employeeCard"
                      type="text"
                      placeholder="Enter your employee card number"
                      value={credentials.employeeCard}
                      onChange={(e) =>
                        handleInputChange("employeeCard", e.target.value)
                      }
                      className="h-11"
                      aria-invalid={!!errors.employeeCard}
                    />
                    {errors.employeeCard && (
                      <p className="text-sm text-red-600">
                        {errors.employeeCard}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <CreditCard className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Employee Card Login</p>
                        <p className="text-blue-600 mt-1">
                          Use your physical employee card number for quick
                          access
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleLogin("card")}
                    disabled={isLoading}
                    className="w-full h-11 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
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
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between text-sm">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Forgot password?
                </button>
                <button className="text-gray-600 hover:text-gray-800">
                  Need help?
                </button>
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
            By signing in, you agree to our{" "}
            <button className="text-blue-600 hover:text-blue-800">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="text-blue-600 hover:text-blue-800">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
