'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Loader2, Users, UserCheck, UserX } from 'lucide-react'
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

interface User {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  createdAt: string
  contact?: {
    name: string
    mobile?: string
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/contacts')
      const data = await res.json()
      
      if (data.success) {
        const transformedUsers: User[] = (data.data || []).map((contact: { id: string; name: string; email: string; type: string; mobile?: string; createdAt: string }) => ({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          role: contact.type === 'VENDOR' ? 'INTERNAL' : 'PORTAL',
          active: true,
          createdAt: contact.createdAt,
          contact: {
            name: contact.name,
            mobile: contact.mobile,
          }
        }))
        setUsers(transformedUsers)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'INTERNAL': return 'default'
      case 'PORTAL': return 'secondary'
      default: return 'outline'
    }
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    setDeleting(true)
    
    try {
      const res = await fetch(`/api/contacts/${deleteUser.id}`, { method: 'DELETE' })
      const data = await res.json()
      
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id))
        toast.success('User deleted!')
        setDeleteUser(null)
      } else {
        toast.error(data.message || 'Failed to delete user')
      }
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setDeleting(false)
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
        <h1 className="page-title">Users</h1>
        <Link href="/admin/register">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus size={18} className="mr-1" />
            New Admin User
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'INTERNAL').length}</p>
                <p className="text-sm text-muted-foreground">Admin Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserX className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'PORTAL').length}</p>
                <p className="text-sm text-muted-foreground">Portal Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setRoleFilter('all')}
                variant={roleFilter === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                All
              </Button>
              <Button
                onClick={() => setRoleFilter('INTERNAL')}
                variant={roleFilter === 'INTERNAL' ? 'default' : 'outline'}
                size="sm"
              >
                Admins
              </Button>
              <Button
                onClick={() => setRoleFilter('PORTAL')}
                variant={roleFilter === 'PORTAL' ? 'default' : 'outline'}
                size="sm"
              >
                Customers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleVariant(user.role)}>
                      {user.role === 'INTERNAL' ? 'Admin' : 'Customer'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.contact?.mobile || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.active ? 'default' : 'destructive'}>
                      {user.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/contacts/${user.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      <Link href={`/admin/contacts/${user.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteUser(user)}
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
            <h2 className="text-xl font-semibold mb-2">No users found</h2>
            <p className="text-muted-foreground mb-6">
              {users.length === 0 
                ? 'Users will appear here as they register.' 
                : 'Try adjusting your search or filter.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteUser?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>
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
