'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Shield, UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

export default function AdminRegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [agreed, setAgreed] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: '', // Special code to register as admin
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success && data.data?.role === 'INTERNAL') {
          router.push('/admin')
        }
      } catch {
        // Not logged in
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.adminCode) newErrors.adminCode = 'Admin code is required'
    else if (formData.adminCode !== 'ADMIN2024') newErrors.adminCode = 'Invalid admin code'
    if (!agreed) newErrors.terms = 'You must agree to the terms'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Please check the form to ensure all fields are correct.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'INTERNAL', // Register as admin
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Success! Your admin account has been created. Please log in.')
        router.push('/admin/login')
      } else {
        if (data.errors) {
          Object.entries(data.errors).forEach(([key, value]) => {
            setErrors((prev) => ({ ...prev, [key]: (value as string[])[0] }))
          })
        }
        toast.error(data.message || 'We couldn\'t create your account. Please try again.')
      }
    } catch {
      toast.error('Something went wrong on our end. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: '' }))
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Admin Registration</CardTitle>
            <CardDescription>Create a new administrator account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="admin@appareldesk.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminCode">Admin Code *</Label>
              <Input
                id="adminCode"
                type="password"
                value={formData.adminCode}
                onChange={(e) => handleChange('adminCode', e.target.value)}
                placeholder="Enter admin registration code"
                className={errors.adminCode ? 'border-red-500' : ''}
              />
              {errors.adminCode && <p className="text-red-500 text-sm">{errors.adminCode}</p>}
              <p className="text-xs text-muted-foreground">Contact your administrator for the registration code</p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreed}
                onCheckedChange={(checked) => {
                  setAgreed(checked as boolean)
                  if (errors.terms) setErrors((err) => ({ ...err, terms: '' }))
                }}
              />
              <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
            {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

            <Button type="submit" disabled={isLoading} className="w-full bg-amber-600 hover:bg-amber-700">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserPlus size={18} className="mr-2" />
              )}
              Create Admin Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Already have an account?</p>
            <Link href="/admin/login" className="text-amber-600 font-medium hover:underline text-sm">
              Sign in to Admin
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/register" className="text-sm text-muted-foreground hover:underline">
              ← Register as Customer
            </Link>
          </div>

          {/* Demo hint */}
          <div className="mt-6 p-4 bg-slate-100 rounded-lg text-sm">
            <p className="font-medium mb-1">Demo Admin Code:</p>
            <p className="text-muted-foreground font-mono">ADMIN2024</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
