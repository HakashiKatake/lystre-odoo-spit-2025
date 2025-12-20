"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/products";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
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
        if (data.success) {
          // Already logged in - redirect based on role
          if (data.data?.role === "INTERNAL") {
            router.push("/admin");
          } else {
            router.push("/products");
          }
        }
      } catch {
        // Not logged in - that's fine
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

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
      toast.error("Please fix the validation errors");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, rememberMe }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Login successful!");
        // Redirect internal users to admin, portal users to products
        if (data.data.role === "INTERNAL") {
          router.push("/admin");
        } else {
          router.push(from);
        }
        router.refresh();
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl w-full mx-auto">
      <CardContent className="p-10">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-serif text-[#8B7355] mb-2 tracking-wide">
            Lystré
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-[#2B1810]"
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
              placeholder="you@example.com"
              autoComplete="email"
              className={`bg-white border-[#E5E7EB] focus:border-[#8B7355] focus:ring-[#8B7355] h-12 rounded-lg ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-[#2B1810]"
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
                placeholder="........"
                autoComplete="current-password"
                className={`bg-white border-[#E5E7EB] focus:border-[#8B7355] focus:ring-[#8B7355] h-12 rounded-lg pr-10 ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#8B7355] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-[#2B1810] data-[state=checked]:bg-[#8B7355] data-[state=checked]:border-[#8B7355]"
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer text-[#4B5563]"
              >
                Remember me
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-[#8B7355] font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#F9F9F9] hover:bg-[#F0F0F0] text-[#2B1810] border-2 border-[#2B1810] rounded-lg font-bold tracking-wide shadow-[4px_4px_0px_#2B1810] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              "SIGN IN"
            )}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-[#6B7280]">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#8B7355] font-medium hover:underline"
          >
            Create one
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
          <p className="text-center text-sm text-muted-foreground mb-4">
            Are you an administrator?
          </p>
          <Link href="/admin/login" className="block">
            <Button
              variant="outline"
              className="w-full h-10 border-[#2B1810] text-[#2B1810] hover:bg-[#F5EBE0]"
            >
              Go to Admin Login
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
