'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, List, Users, BarChart } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Správa Pocket Vibe Coder Terms Library
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <List className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Správa termínů</h3>
                  <p className="text-sm text-gray-500">Upravit existující termíny</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/admin/terms">
                  <Button variant="outline" className="w-full">
                    Zobrazit termíny
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <Plus className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Nový termín</h3>
                  <p className="text-sm text-gray-500">Přidat nový termín do slovníku</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/admin/terms/new">
                  <Button className="w-full">
                    Vytvořit termín
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <BarChart className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Statistiky</h3>
                  <p className="text-sm text-gray-500">Přehled dat</p>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" disabled>
                  Připravuje se
                </Button>
              </div>
            </Card>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Vítejte v admin rozhraní!
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Zde můžete spravovat termíny ve slovníku. Všechny změny se projeví okamžitě 
                    na veřejné stránce knihovny.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}