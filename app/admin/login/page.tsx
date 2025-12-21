"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Shield, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Suspense } from "react";
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

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.data?.role === "INTERNAL") {
          router.push(from);
        }
      } catch {
        // Not logged in
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [from, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please check the form for errors and try again");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Check if user is internal/admin
        if (data.data.role !== "INTERNAL") {
          toast.error("Access denied. You need admin rights to enter here.");
          return;
        }
        toast.success("Welcome back! You have successfully logged in.");
        router.push(from);
        router.refresh();
      } else {
        toast.error(
          data.message ||
            "Login failed. Please verify your credentials and try again."
        );
      }
    } catch {
      toast.error(
        "Something went wrong. Please refresh the page and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white p-4 font-mono"
      style={{
        backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <Card className="w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none bg-white">
        <CardHeader className="text-center space-y-4 border-b-4 border-black pb-6">
          <div className="mx-auto w-16 h-16 bg-amber-400 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <div>
            <CardTitle className="text-3xl font-black uppercase tracking-tighter text-black">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-black font-bold text-base">
              SECURE ACCESS ONLY
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-black font-black uppercase text-sm"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData((f) => ({ ...f, email: e.target.value }));
                  if (errors.email) setErrors((err) => ({ ...err, email: "" }));
                }}
                placeholder="admin@appareldesk.com"
                className={`h-12 border-2 border-black rounded-none text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  errors.email ? "bg-red-100" : "bg-white"
                }`}
              />
              {errors.email && (
                <p className="text-red-600 font-bold text-xs border-l-2 border-red-600 pl-2">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-black font-black uppercase text-sm"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData((f) => ({ ...f, password: e.target.value }));
                    if (errors.password)
                      setErrors((err) => ({ ...err, password: "" }));
                  }}
                  placeholder="Enter your password"
                  className={`h-12 border-2 border-black rounded-none text-black placeholder:text-gray-500 pr-10 focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                    errors.password ? "bg-red-100" : "bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-amber-600 transition-colors bg-white border-2 border-transparent hover:border-black p-0.5"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 font-bold text-xs border-l-2 border-red-600 pl-2">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-amber-400 text-black border-2 border-black rounded-none font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-amber-500 transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Lock size={18} className="mr-2 stroke-[3]" />
              )}
              Enter System
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-black text-center space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-black">Need access?</p>
              <Link
                href="/admin/register"
                className="inline-block text-black font-black text-sm hover:underline decoration-2 underline-offset-2 hover:text-amber-600 uppercase"
              >
                Request Admin Account
              </Link>
            </div>

            <div>
              <Link
                href="/login"
                className="text-xs text-gray-500 hover:text-black hover:underline"
              >
                ← Return to Public Site
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
