"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, UserCircle, MapPin, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";

interface UserProfile {
  id: string;
  contactId: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    contactId: "",
    name: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch profile - BACKEND LOGIC PRESERVED
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.success && data.data) {
        setProfile({
          id: data.data.id,
          contactId: data.data.contactId || "",
          name: data.data.name || data.data.contact?.name || "",
          email: data.data.email,
          mobile: data.data.contact?.mobile || "",
          address: data.data.contact?.address || "",
          city: data.data.contact?.city || "",
          state: data.data.contact?.state || "",
          pincode: data.data.contact?.pincode || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error("We encountered an issue loading your profile. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  // Save profile - BACKEND LOGIC PRESERVED
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/contacts/${profile.contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          mobile: profile.mobile,
          street: profile.address,
          city: profile.city,
          state: profile.state,
          pincode: profile.pincode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Profile updated successfully! Your changes have been saved.");
      } else {
        toast.error(data.message || "We couldn't update your profile. Please try again.");
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error("An error occurred while saving your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Change password - BACKEND LOGIC PRESERVED
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("The new passwords do not match. Please try again.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Your password must be at least 6 characters long.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Password changed successfully! You can now use your new password.");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.message || "We couldn't change your password. Please try again.");
      }
    } catch (err) {
      console.error("Failed to change password:", err);
      toast.error("An error occurred while changing your password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFEF9] flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    );
  }

  return (
    <div className="bg-[#FFFEF9]">
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account">
            <button className="p-2 border-2 border-[#2B1810] hover:bg-[#F5EBE0] transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#2B1810]" />
            </button>
          </Link>
          <h1 className="text-3xl font-serif text-[#2B1810]">Edit Profile</h1>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white border-2 border-[#2B1810] p-8">
            <div className="flex items-center gap-3 mb-6">
              <UserCircle className="w-6 h-6 text-[#8B7355]" />
              <h2 className="text-xl font-serif text-[#2B1810]">Personal Information</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#2B1810] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B1810] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 border-2 border-[#2B1810] bg-[#F5EBE0] text-[#8B7355] cursor-not-allowed"
                  />
                  <p className="text-xs text-[#8B7355] mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B1810] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.mobile}
                    onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344] px-8"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Personal Info
                </Button>
              </div>
            </form>
          </div>

          {/* Address */}
          <div className="bg-white border-2 border-[#2B1810] p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-[#8B7355]" />
              <h2 className="text-xl font-serif text-[#2B1810]">Address</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2B1810] mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                  placeholder="123 Main Street, Apartment 4B"
                  className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#2B1810] mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                    placeholder="Mumbai"
                    className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B1810] mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={profile.state}
                    onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
                    placeholder="Maharashtra"
                    className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B1810] mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={profile.pincode}
                    onChange={(e) => setProfile((p) => ({ ...p, pincode: e.target.value }))}
                    placeholder="400001"
                    className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344] px-8"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Address
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white border-2 border-[#2B1810] p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-[#8B7355]" />
              <h2 className="text-xl font-serif text-[#2B1810]">Change Password</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2B1810] mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#2B1810] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B1810] mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
                  variant="outline"
                  className="border-2 border-[#2B1810] px-8"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Change Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
