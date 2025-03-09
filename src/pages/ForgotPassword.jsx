import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { mockApi } from '../lib/mockApi'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      setMessage(null)
      // In our mock implementation, we'll just show a success message
      setMessage('If an account exists with this email, you will receive a password reset link')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          )}
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="text-sm text-right">
            <Link
              to="/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to sign in
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {loading ? 'Sending reset link...' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  )
}