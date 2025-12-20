'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Users, Building, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Contact {
  id: string
  name: string
  type: string
  email: string
  mobile?: string
  city?: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'CUSTOMER' | 'VENDOR' | 'BOTH'>('all')
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts')
      const data = await res.json()
      if (data.success) {
        setContacts(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err)
      toast.error('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' ? true : c.type === filter
    return matchesSearch && matchesFilter
  })

  const handleDelete = async () => {
    if (!deleteContact) return
    setDeleting(true)
    
    try {
      const res = await fetch(`/api/contacts/${deleteContact.id}`, { method: 'DELETE' })
      const data = await res.json()
      
      if (data.success) {
        setContacts((prev) => prev.filter((c) => c.id !== deleteContact.id))
        toast.success('Contact deleted!')
        setDeleteContact(null)
      } else {
        toast.error(data.message || 'Failed to delete contact')
      }
    } catch {
      toast.error('Failed to delete contact')
    } finally {
      setDeleting(false)
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Contacts</h1>
        <Link href="/admin/contacts/new">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus size={18} className="mr-1" />
            New Contact
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                All ({contacts.length})
              </Button>
              <Button
                onClick={() => setFilter('CUSTOMER')}
                variant={filter === 'CUSTOMER' ? 'default' : 'outline'}
                size="sm"
              >
                <Users size={16} className="mr-1" />
                Customers
              </Button>
              <Button
                onClick={() => setFilter('VENDOR')}
                variant={filter === 'VENDOR' ? 'default' : 'outline'}
                size="sm"
              >
                <Building size={16} className="mr-1" />
                Vendors
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      {filteredContacts.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(contact.type)}>{contact.type}</Badge>
                  </TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell>{contact.mobile || '-'}</TableCell>
                  <TableCell>{contact.city || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/contacts/${contact.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      <Link href={`/admin/contacts/${contact.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteContact(contact)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Users size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No contacts found</h2>
            <p className="text-muted-foreground mb-6">
              {contacts.length === 0 
                ? 'Add your first contact.' 
                : 'Try adjusting your search or filter.'}
            </p>
            <Link href="/admin/contacts/new">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus size={18} className="mr-1" />
                Add Contact
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteContact} onOpenChange={() => setDeleteContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteContact?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteContact(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
