'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/products'

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success) {
          // Already logged in - redirect based on role
          if (data.data?.role === 'INTERNAL') {
            router.push('/admin')
          } else {
            router.push('/products')
          }
        }
      } catch {
        // Not logged in - that's fine
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address'
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      toast.error('Please fix the validation errors')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, rememberMe }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Login successful!')
        // Redirect internal users to admin, portal users to products
        if (data.data.role === 'INTERNAL') {
          router.push('/admin')
        } else {
          router.push(from)
        }
        router.refresh()
      } else {
        toast.error(data.message || 'Login failed')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-bold text-xl">ApparelDesk</span>
        </div>

        <h1 className="text-2xl font-bold mb-2">Sign in to your account</h1>
        <p className="text-muted-foreground mb-6">
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((f) => ({ ...f, email: e.target.value }))
                if (errors.email) setErrors((err) => ({ ...err, email: '' }))
              }}
              placeholder="Enter your email"
              autoComplete="email"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => {
                  setFormData((f) => ({ ...f, password: e.target.value }))
                  if (errors.password) setErrors((err) => ({ ...err, password: '' }))
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Remember me
              </Label>
            </div>
            <Link href="/forgot-password" className="text-sm text-amber-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-amber-600 hover:bg-amber-700" size="lg">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <LogIn size={18} className="mr-2" />
            )}
            Sign In
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-amber-600 font-medium hover:underline">
            Create one
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t">
          <p className="text-center text-sm text-muted-foreground mb-3">Are you an administrator?</p>
          <Link href="/admin/login" className="block">
            <Button variant="outline" className="w-full">
              Go to Admin Login
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
