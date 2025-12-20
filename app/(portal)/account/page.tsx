"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, FileText, UserCircle, Loader2, MapPin, Phone, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { toast } from "sonner";

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

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"profile" | "orders" | "invoices">("profile");
  
  // Backend state - API data
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

  // Fetch profile from API - BACKEND LOGIC PRESERVED
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
      toast.error("Failed to load profile");
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
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Change password - BACKEND LOGIC PRESERVED
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
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
        toast.success("Password changed successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (err) {
      console.error("Failed to change password:", err);
      toast.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const formatAddress = () => {
    const parts = [profile.address, profile.city, profile.state, profile.pincode].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
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
      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Account Menu */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-[#2B1810] p-6">
              <h1 className="text-3xl font-serif text-[#2B1810] mb-8">My Account</h1>

              {/* Menu Options - Stacked without gaps */}
              <div className="border-2 border-[#2B1810]">
                {/* User Profile - Active */}
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`w-full flex items-center gap-4 p-4 border-b-2 border-[#2B1810] transition-all ${
                    activeSection === "profile"
                      ? "bg-[#F5EBE0]"
                      : "bg-white hover:bg-[#F5EBE0]/50"
                  }`}
                >
                  <UserCircle className="w-6 h-6 text-[#2B1810]" />
                  <span className="text-lg font-medium text-[#2B1810]">User Profile</span>
                </button>

                {/* Your Orders */}
                <button
                  onClick={() => router.push("/orders")}
                  className="w-full flex items-center gap-4 p-4 bg-white hover:bg-[#F5EBE0]/50 transition-all border-b-2 border-[#2B1810]"
                >
                  <Package className="w-6 h-6 text-[#2B1810]" />
                  <span className="text-lg font-medium text-[#2B1810]">Your Orders</span>
                </button>

                {/* Your Invoices */}
                <button
                  onClick={() => router.push("/invoices")}
                  className="w-full flex items-center gap-4 p-4 bg-white hover:bg-[#F5EBE0]/50 transition-all border-b-2 border-[#2B1810]"
                >
                  <FileText className="w-6 h-6 text-[#2B1810]" />
                  <span className="text-lg font-medium text-[#2B1810]">Your Invoices</span>
                </button>

                {/* Logout */}
                <button
                  onClick={async () => {
                    try {
                      await fetch("/api/auth/logout", { method: "POST" });
                      toast.success("Logged out successfully");
                      router.push("/login");
                    } catch {
                      toast.error("Failed to logout");
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-white hover:bg-[#EF4444]/10 transition-all"
                >
                  <LogOut className="w-6 h-6 text-[#EF4444]" />
                  <span className="text-lg font-medium text-[#EF4444]">Logout</span>
                </button>
              </div>

              {/* User Summary Card */}
              <div className="mt-8 p-4 bg-[#F5EBE0] border-2 border-[#2B1810]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#8B7355] rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-[#2B1810]">
                    {profile.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h2 className="font-bold text-[#2B1810]">{profile.name || "User"}</h2>
                    <p className="text-sm text-[#8B7355]">{profile.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Phone size={14} className="text-[#8B7355] mt-0.5" />
                    <span className="text-[#2B1810]">
                      {profile.mobile || <span className="italic text-[#8B7355]">Not set</span>}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail size={14} className="text-[#8B7355] mt-0.5" />
                    <span className="text-[#2B1810]">{profile.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-[#8B7355] mt-0.5" />
                    <span className="text-[#2B1810]">
                      {formatAddress() || <span className="italic text-[#8B7355]">No address set</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-[#2B1810] p-8">
              {/* User Profile Section */}
              {activeSection === "profile" && (
                <div>
                  <h2 className="text-2xl font-serif text-[#2B1810] mb-6">User Profile</h2>
                  <p className="text-sm text-[#8B7355] mb-8">
                    From here you can edit your name, email, password, address etc.
                  </p>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* User Name */}
                    <div>
                      <label className="block text-sm font-medium text-[#2B1810] mb-2">
                        User Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810]"
                      />
                    </div>

                    {/* Email */}
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

                    {/* Phone Number */}
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

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-[#2B1810] mb-2">
                        Street Address
                      </label>
                      <textarea
                        value={profile.address}
                        onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                        rows={2}
                        placeholder="123 Main Street, Apartment 4B"
                        className="w-full px-4 py-3 border-2 border-[#2B1810] focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-[#2B1810] resize-none"
                      />
                    </div>

                    {/* City, State, Pincode */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    {/* Save Profile Button */}
                    <div className="flex justify-end gap-4 pt-4 border-t-2 border-[#E5D4C1]">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-2 border-[#2B1810] px-8"
                        onClick={() => fetchProfile()}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-[#8B7355] text-white border-2 border-[#2B1810] hover:bg-[#6B5344] px-8"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Changes
                      </Button>
                    </div>
                  </form>

                  {/* Password Change Section */}
                  <div className="mt-12 pt-8 border-t-2 border-[#E5D4C1]">
                    <h3 className="text-xl font-serif text-[#2B1810] mb-6">Change Password</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
