'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Plus, List, BarChart } from 'lucide-react'
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
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <List className="w-6 h-6 text-gray-700" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Správa termínů</h3>
                  <p className="text-sm text-gray-600">Upravit existující termíny</p>
                </div>
              </div>
              <Link href="/admin/terms">
                <Button variant="outline" className="w-full">
                  Zobrazit termíny
                </Button>
              </Link>
            </div>

            <div className="bg-white border rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Plus className="w-6 h-6 text-gray-700" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Nový termín</h3>
                  <p className="text-sm text-gray-600">Přidat nový termín do slovníku</p>
                </div>
              </div>
              <Link href="/admin/terms/new">
                <Button className="w-full">
                  Vytvořit termín
                </Button>
              </Link>
            </div>

            <div className="bg-white border rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <BarChart className="w-6 h-6 text-gray-700" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Statistiky</h3>
                  <p className="text-sm text-gray-600">Přehled dat</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Připravuje se
              </Button>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Vítejte v admin rozhraní!
            </h3>
            <p className="text-gray-600">
              Zde můžete spravovat termíny ve slovníku. Všechny změny se projeví okamžitě 
              na veřejné stránce knihovny.
            </p>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}