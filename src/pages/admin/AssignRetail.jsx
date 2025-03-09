import React, { useState, useEffect } from 'react'
import { mockApi } from '../../lib/mockApi'

export default function AssignRetail() {
  const [retailers, setRetailers] = useState([])
  const [collectors, setCollectors] = useState([])
  const [selectedCollector, setSelectedCollector] = useState(null)
  const [unassignedRetailers, setUnassignedRetailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const retailData = await mockApi.getRetailUsers()
      const collectorData = await mockApi.getCollectors()

      setRetailers(retailData)
      setCollectors(collectorData)
      
      // If no collector is selected, reset unassigned retailers
      if (!selectedCollector) {
        setUnassignedRetailers(retailData.filter(r => !r.assignedCollectorId))
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCollectorSelect = (collectorId) => {
    const collector = collectors.find(c => c.id === collectorId)
    setSelectedCollector(collector)
    // Update unassigned retailers list
    setUnassignedRetailers(retailers.filter(r => !r.assignedCollectorId))
  }

  const handleAssign = async (retailerId) => {
    try {
      setError(null)
      await mockApi.assignCollector(retailerId, selectedCollector.id)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchUsers()
    } catch (error) {
      setError(error.message)
    }
  }

  const handleUnassign = async (retailerId) => {
    try {
      setError(null)
      await mockApi.assignCollector(retailerId, null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchUsers()
    } catch (error) {
      setError(error.message)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Assign Retail Users to Collectors</h1>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
          Assignment updated successfully!
        </div>
      )}

      <div className="mt-6">
        <label htmlFor="collector" className="block text-sm font-medium text-gray-700">
          Select Collector
        </label>
        <select
          id="collector"
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          value={selectedCollector?.id || ''}
          onChange={(e) => handleCollectorSelect(e.target.value)}
        >
          <option value="">Select a collector</option>
          {collectors.map((collector) => (
            <option key={collector.id} value={collector.id}>
              {collector.email}
            </option>
          ))}
        </select>
      </div>

      {selectedCollector && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Assigned Retail Users</h2>
          <div className="mt-4 space-y-4">
            {retailers
              .filter(r => r.assignedCollectorId === selectedCollector.id)
              .map(retailer => (
                <div key={retailer.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                  <span>{retailer.email}</span>
                  <button
                    onClick={() => handleUnassign(retailer.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              ))
            }
          </div>

          <h2 className="mt-8 text-lg font-medium text-gray-900">Available Retail Users</h2>
          <div className="mt-4 space-y-4">
            {unassignedRetailers.map(retailer => (
              <div key={retailer.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                <span>{retailer.email}</span>
                <button
                  onClick={() => handleAssign(retailer.id)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}