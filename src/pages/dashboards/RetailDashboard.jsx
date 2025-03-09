import React, { useState, useEffect } from 'react'
import { mockApi } from '../../lib/mockApi'

export default function RetailDashboard() {
  const [stats, setStats] = useState(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await mockApi.getStats()
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransaction = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      await mockApi.createTransaction(Number(amount))
      setSuccess(true)
      setAmount('')
      setTimeout(() => setSuccess(false), 3000)
      fetchStats() // Refresh stats instead of reloading the page
    } catch (error) {
      setError(error.message)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  if (!stats) {
    return <div>No data available</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Retail Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Liability Amount
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              ${stats.totalLiability}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Liability</h3>
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
                  Transaction created successfully!
                </div>
              )}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  min="0"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Liability
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
          <div className="mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handover Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'Done' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.handoverDate || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}