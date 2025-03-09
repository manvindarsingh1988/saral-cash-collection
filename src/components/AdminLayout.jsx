import React from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { mockApi } from '../lib/mockApi'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => {
    return location.pathname === path ? 'bg-indigo-700' : ''
  }

  const handleSignOut = async () => {
    await mockApi.signOut()
    navigate('/signin')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-white text-xl font-bold">Admin Dashboard</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    to="/admin"
                    className={`${isActive('/admin')} text-white rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/add-collector"
                    className={`${isActive('/admin/add-collector')} text-white rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    Add Collector
                  </Link>
                  <Link
                    to="/admin/assign-retail"
                    className={`${isActive('/admin/assign-retail')} text-white rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    Assign Retail Users
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <button
                onClick={handleSignOut}
                className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}