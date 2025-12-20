'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, User, MapPin, Phone, Mail, Building } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Contact {
  id: string
  name: string
  email: string | null
  mobile: string | null
  street: string | null
  city: string | null
  state: string | null
  pincode: string | null
  type: 'CUSTOMER' | 'VENDOR' | 'BOTH'
  createdAt: string
}

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Contact>>({})

  useEffect(() => {
    fetchContact()
  }, [params.id])

  const fetchContact = async () => {
    try {
      const res = await fetch(`/api/contacts/${params.id}`)
      const data = await res.json()
      
      if (data.success) {
        setContact(data.data)
        setFormData(data.data)
      } else {
        toast.error('Contact not found')
        router.push('/admin/contacts')
      }
    } catch (err) {
      console.error('Failed to fetch contact:', err)
      toast.error('Failed to load contact')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const res = await fetch(`/api/contacts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          type: formData.type,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Contact updated successfully!')
        setContact(data.data)
        setIsEditing(false)
      } else {
        toast.error(data.message || 'Failed to update contact')
      }
    } catch (err) {
      console.error('Failed to save contact:', err)
      toast.error('Failed to save contact')
    } finally {
      setSaving(false)
    }
  }

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'CUSTOMER': return 'default'
      case 'VENDOR': return 'secondary'
      case 'BOTH': return 'outline'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Contact not found</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/contacts">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{contact.name}</h1>
            <p className="text-muted-foreground">{contact.email || 'No email'}</p>
          </div>
          <Badge variant={getTypeVariant(contact.type)}>{contact.type}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => {
                setIsEditing(false)
                setFormData(contact)
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                Save
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-amber-600 hover:bg-amber-700">
              Edit Contact
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData((f) => ({ ...f, type: value as 'CUSTOMER' | 'VENDOR' | 'BOTH' }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CUSTOMER">Customer</SelectItem>
                          <SelectItem value="VENDOR">Vendor</SelectItem>
                          <SelectItem value="BOTH">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile">Mobile</Label>
                      <Input
                        id="mobile"
                        value={formData.mobile || ''}
                        onChange={(e) => setFormData((f) => ({ ...f, mobile: e.target.value }))}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{contact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant={getTypeVariant(contact.type)}>{contact.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{contact.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium">{contact.mobile || '-'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={formData.street || ''}
                      onChange={(e) => setFormData((f) => ({ ...f, street: e.target.value }))}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city || ''}
                        onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))}
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state || ''}
                        onChange={(e) => setFormData((f) => ({ ...f, state: e.target.value }))}
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode || ''}
                        onChange={(e) => setFormData((f) => ({ ...f, pincode: e.target.value }))}
                        placeholder="400001"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {contact.street || contact.city || contact.state ? (
                    <p className="font-medium">
                      {[contact.street, contact.city, contact.state, contact.pincode].filter(Boolean).join(', ')}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">No address set</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <User className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{contact.type}</p>
                </div>
              </div>
              {contact.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{contact.email}</p>
                  </div>
                </div>
              )}
              {contact.mobile && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium">{contact.mobile}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
