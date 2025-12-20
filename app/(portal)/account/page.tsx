'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Package, FileText, MapPin, Phone, Mail, ChevronRight, Loader2, Edit } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface UserProfile {
  id: string
  name: string
  email: string
  mobile?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      
      if (data.success && data.data) {
        setUser({
          id: data.data.id,
          name: data.data.name || data.data.email.split('@')[0],
          email: data.data.email,
          mobile: data.data.contact?.mobile || '',
          address: data.data.contact?.address || '',
          city: data.data.contact?.city || '',
          state: data.data.contact?.state || '',
          pincode: data.data.contact?.pincode || '',
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = () => {
    if (!user) return null
    const parts = [user.address, user.city, user.state, user.pincode].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Cards */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/account/profile">
            <Card className="hover:border-amber-500 transition-colors cursor-pointer">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <User className="text-amber-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">User Profile</h3>
                  <p className="text-sm text-muted-foreground">Edit your name, email, password and address</p>
                </div>
                <ChevronRight className="text-muted-foreground" size={20} />
              </CardContent>
            </Card>
          </Link>

          <Link href="/orders">
            <Card className="hover:border-amber-500 transition-colors cursor-pointer">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Your Orders</h3>
                  <p className="text-sm text-muted-foreground">View and track all your orders</p>
                </div>
                <ChevronRight className="text-muted-foreground" size={20} />
              </CardContent>
            </Card>
          </Link>

          <Link href="/invoices">
            <Card className="hover:border-amber-500 transition-colors cursor-pointer">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-green-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Your Invoices</h3>
                  <p className="text-sm text-muted-foreground">Download invoices and payment history</p>
                </div>
                <ChevronRight className="text-muted-foreground" size={20} />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* User Summary */}
        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="font-bold text-lg">{user?.name || 'User'}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {user?.mobile || <span className="text-gray-400 italic">Not set</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {formatAddress() || <span className="text-gray-400 italic">No address set</span>}
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/account/profile">
                <Button className="w-full mt-6 bg-amber-600 hover:bg-amber-700">
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
