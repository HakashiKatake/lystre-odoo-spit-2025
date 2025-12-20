'use client'

import { useEffect, useState } from 'react'
import { Settings, Save, Loader2, FileText, Bell, Shield, Database } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface SettingsData {
  id?: string
  automaticInvoicing: boolean
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SettingsData>({
    automaticInvoicing: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      
      if (data.success && data.data) {
        setSettings({
          id: data.data.id,
          automaticInvoicing: data.data.automaticInvoicing || false,
        })
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          automaticInvoicing: settings.automaticInvoicing,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Settings saved successfully!')
      } else {
        toast.error(data.message || 'Failed to save settings')
      }
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const toggleAutomaticInvoicing = async (checked: boolean) => {
    setSettings((s) => ({ ...s, automaticInvoicing: checked }))
    
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          automaticInvoicing: checked,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(checked ? 'Automatic invoicing enabled' : 'Automatic invoicing disabled')
      } else {
        // Revert on failure
        setSettings((s) => ({ ...s, automaticInvoicing: !checked }))
        toast.error(data.message || 'Failed to update setting')
      }
    } catch {
      setSettings((s) => ({ ...s, automaticInvoicing: !checked }))
      toast.error('Failed to update setting')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={28} className="text-amber-600" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Invoicing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Invoicing
            </CardTitle>
            <CardDescription>
              Configure automatic invoice generation and billing settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Automatic Invoice Generation</p>
                <p className="text-sm text-muted-foreground">
                  Automatically create invoices when sale orders are confirmed
                </p>
              </div>
              <Switch
                checked={settings.automaticInvoicing}
                onCheckedChange={toggleAutomaticInvoicing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure email and system notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Order Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email when new orders are placed
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when product stock falls below threshold
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Payment Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Send automatic payment reminders for overdue invoices
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Security
            </CardTitle>
            <CardDescription>
              Security and access control settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">
                  Automatically log out after period of inactivity
                </p>
              </div>
              <span className="text-sm font-medium">30 minutes</span>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={20} />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Application</p>
                <p className="font-medium">ApparelDesk ERP</p>
              </div>
              <div>
                <p className="text-muted-foreground">Version</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">Environment</p>
                <p className="font-medium">Development</p>
              </div>
              <div>
                <p className="text-muted-foreground">Database</p>
                <p className="font-medium">PostgreSQL</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
