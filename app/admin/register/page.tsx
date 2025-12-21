"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Shield, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "", // Special code to register as admin
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.data?.role === "INTERNAL") {
          router.push("/admin");
        }
      } catch {
        // Not logged in
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.adminCode) newErrors.adminCode = "Admin code is required";
    else if (formData.adminCode !== "ADMIN2024")
      newErrors.adminCode = "Invalid admin code";
    if (!agreed) newErrors.terms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please check the form to ensure all fields are correct.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "INTERNAL", // Register as admin
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Success! Your admin account has been created. Please log in."
        );
        router.push("/admin/login");
      } else {
        if (data.errors) {
          Object.entries(data.errors).forEach(([key, value]) => {
            setErrors((prev) => ({ ...prev, [key]: (value as string[])[0] }));
          });
        }
        toast.error(
          data.message || "We couldn't create your account. Please try again."
        );
      }
    } catch {
      toast.error("Something went wrong on our end. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: "" }));
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
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
              New Admin
            </CardTitle>
            <CardDescription className="text-black font-bold text-base">
              SYSTEM REGISTRATION
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-black font-black uppercase text-sm"
              >
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="JOHN DOE"
                className={`h-11 border-2 border-black rounded-none text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  errors.name ? "bg-red-100" : "bg-white"
                }`}
              />
              {errors.name && (
                <p className="text-red-600 font-bold text-xs border-l-2 border-red-600 pl-2">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-black font-black uppercase text-sm"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="ADMIN@APPARELDESK.COM"
                className={`h-11 border-2 border-black rounded-none text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
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
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="MIN. 6 CHARACTERS"
                  className={`h-11 border-2 border-black rounded-none text-black placeholder:text-gray-500 pr-10 focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                    errors.password ? "bg-red-100" : "bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-amber-600 bg-white border-2 border-transparent hover:border-black p-0.5"
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

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-black font-black uppercase text-sm"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                placeholder="REPEAT PASSWORD"
                className={`h-11 border-2 border-black rounded-none text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  errors.confirmPassword ? "bg-red-100" : "bg-white"
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 font-bold text-xs border-l-2 border-red-600 pl-2">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="adminCode"
                className="text-black font-black uppercase text-sm"
              >
                Admin Code
              </Label>
              <Input
                id="adminCode"
                type="password"
                value={formData.adminCode}
                onChange={(e) => handleChange("adminCode", e.target.value)}
                placeholder="REGISTRATION CODE"
                className={`h-11 border-2 border-black rounded-none text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  errors.adminCode ? "bg-red-100" : "bg-white"
                }`}
              />
              {errors.adminCode && (
                <p className="text-red-600 font-bold text-xs border-l-2 border-red-600 pl-2">
                  {errors.adminCode}
                </p>
              )}
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => {
                  setAgreed(checked as boolean);
                  if (errors.terms) setErrors((err) => ({ ...err, terms: "" }));
                }}
                className="border-2 border-black rounded-none w-5 h-5 data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=checked]:border-black mt-0.5"
              />
              <Label
                htmlFor="terms"
                className="text-sm font-bold cursor-pointer leading-tight text-black"
              >
                I AGREE TO THE TERMS OF SERVICE AND PRIVACY POLICY
              </Label>
            </div>
            {errors.terms && (
              <p className="text-red-600 font-bold text-xs border-l-2 border-red-600 pl-2">
                {errors.terms}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-amber-400 text-black border-2 border-black rounded-none font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-amber-500 transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <UserPlus size={18} className="mr-2 stroke-[3]" />
              )}
              Create Account
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-black text-center space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-black">
                Already have an account?
              </p>
              <Link
                href="/admin/login"
                className="inline-block text-black font-black text-sm hover:underline decoration-2 underline-offset-2 hover:text-amber-600 uppercase"
              >
                Sign In Here
              </Link>
            </div>

            <div>
              <Link
                href="/register"
                className="text-xs text-gray-500 hover:text-black hover:underline"
              >
                ← Customer Registration
              </Link>
            </div>
          </div>

          {/* Demo hint style updated */}
          <div className="mt-6 p-3 border-2 border-black bg-gray-100 text-sm font-mono text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold mb-1 uppercase">Demo Access:</p>
            <p className="text-black tracking-widest">ADMIN2024</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
