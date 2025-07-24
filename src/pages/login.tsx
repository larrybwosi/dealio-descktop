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

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    employeeCard: "",
  });

  const handleLogin = async (loginType: "email" | "card") => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (loginType === "email") {
        if (!credentials.email || !credentials.password) {
          toast.error("Please fill in all required fields");
          return;
        }
        toast.success("Login successful! Welcome to Dealio");
      } else {
        if (!credentials.employeeCard) {
          toast.error("Please enter your employee card number");
          return;
        }
        toast.success("Employee card verified! Welcome back");
      }

      // Redirect logic would go here
      console.log("Redirecting to dashboard...");
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
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
              <Tabs defaultValue="email" className="w-full">
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
                    />
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
                    />
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
