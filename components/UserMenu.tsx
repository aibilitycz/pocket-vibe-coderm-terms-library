'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { LogIn, User, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function UserMenu() {
  const { user, userProfile, signOut, loading } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-9 w-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Link href="/auth/login">
        <Button variant="outline" size="sm" className="flex items-center">
          <LogIn className="w-4 h-4 mr-2" />
          Přihlásit
        </Button>
      </Link>
    )
  }

  // If user exists but no profile, show loading state
  if (user && !userProfile) {
    return (
      <div className="animate-pulse">
        <div className="h-9 w-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center"
      >
        <User className="w-4 h-4 mr-2" />
        {user.email?.split('@')[0]}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 border-b">
              <div>{user.email}</div>
              <div className="text-xs text-gray-500 capitalize">
                {userProfile?.role || 'loading...'}
              </div>
            </div>
            {userProfile?.role === 'admin' && (
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={() => setShowDropdown(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Link>
            )}
            <button
              onClick={() => {
                signOut()
                setShowDropdown(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Odhlásit
            </button>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}