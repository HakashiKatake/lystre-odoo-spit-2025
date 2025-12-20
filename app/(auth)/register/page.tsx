"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!agreed) newErrors.terms = "You must agree to the terms";
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Registration successful! Redirecting to products...");
        router.push("/products");
      } else {
        if (data.errors) {
          Object.entries(data.errors).forEach(([key, value]) => {
            setErrors((prev) => ({ ...prev, [key]: (value as string[])[0] }));
          });
        }
        toast.error(data.message || "Registration failed");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: "" }));
  };

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl w-full mx-auto">
      <CardContent className="p-10">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-serif text-[#8B7355] mb-2 tracking-wide">
            Lystré
          </h1>
          <p className="text-muted-foreground text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-xs font-semibold uppercase tracking-wider text-[#2B1810]"
            >
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="John Doe"
              autoComplete="name"
              className={`bg-white border-[#E5E7EB] focus:border-[#8B7355] focus:ring-[#8B7355] h-12 rounded-lg ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

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
              onChange={(e) => handleChange("email", e.target.value)}
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
              htmlFor="mobile"
              className="text-xs font-semibold uppercase tracking-wider text-[#2B1810]"
            >
              Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              className="bg-white border-[#E5E7EB] focus:border-[#8B7355] focus:ring-[#8B7355] h-12 rounded-lg"
            />
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
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="........"
                autoComplete="new-password"
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

          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-semibold uppercase tracking-wider text-[#2B1810]"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="........"
              autoComplete="new-password"
              className={`bg-white border-[#E5E7EB] focus:border-[#8B7355] focus:ring-[#8B7355] h-12 rounded-lg ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => {
                setAgreed(checked as boolean);
                if (errors.terms) setErrors((err) => ({ ...err, terms: "" }));
              }}
              className="border-[#2B1810] data-[state=checked]:bg-[#8B7355] data-[state=checked]:border-[#8B7355]"
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal cursor-pointer text-[#4B5563]"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-[#8B7355] font-medium hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-[#8B7355] font-medium hover:underline"
              >
                Privacy Policy
              </Link>
            </Label>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-xs">{errors.terms}</p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#F9F9F9] hover:bg-[#F0F0F0] text-[#2B1810] border-2 border-[#2B1810] rounded-lg font-bold tracking-wide shadow-[4px_4px_0px_#2B1810] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "SIGN UP"}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-[#6B7280]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#8B7355] font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
