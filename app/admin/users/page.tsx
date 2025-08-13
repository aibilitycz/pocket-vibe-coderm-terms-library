'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserRole, UserProfile } from '@/types/user'
import { getAllUserProfiles, updateUserRole } from '@/lib/user-database'
import { useAuth } from '@/components/auth/AuthProvider'
import { Users, Crown, Eye, AlertCircle } from 'lucide-react'

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const { userProfile } = useAuth()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const userProfiles = await getAllUserProfiles()
    setUsers(userProfiles)
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdating(userId)
    const success = await updateUserRole(userId, newRole)
    
    if (success) {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } else {
      alert('Chyba při změně role uživatele')
    }
    
    setUpdating(null)
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />
      case 'reader':
        return <Eye className="w-4 h-4 text-blue-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'reader':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-gray-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Správa uživatelů</h1>
              <p className="text-gray-600">
                Spravujte role uživatelů aplikace
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Informace o rolích
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Admin:</strong> Může upravovat termíny a spravovat uživatele</li>
                    <li><strong>Reader:</strong> Může pouze prohlížet termíny (výchozí role)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Registrovaní uživatelé ({users.length})
              </h3>
            </div>
            
            <div className="p-0">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Žádní registrovaní uživatelé</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getRoleIcon(user.role)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            Registrován: {new Date(user.created_at).toLocaleDateString('cs-CZ')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getRoleBadgeColor(user.role)} capitalize`}>
                          {user.role === 'admin' ? 'Správce' : 'Čtenář'}
                        </Badge>
                        
                        {user.id !== userProfile?.id && (
                          <div className="flex space-x-2">
                            {user.role !== 'admin' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRoleChange(user.id, 'admin')}
                                disabled={updating === user.id}
                              >
                                {updating === user.id ? 'Aktualizuji...' : 'Povýšit na admin'}
                              </Button>
                            )}
                            {user.role !== 'reader' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRoleChange(user.id, 'reader')}
                                disabled={updating === user.id}
                              >
                                {updating === user.id ? 'Aktualizuji...' : 'Změnit na čtenář'}
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {user.id === userProfile?.id && (
                          <Badge variant="outline" className="text-xs">
                            To jste vy
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}