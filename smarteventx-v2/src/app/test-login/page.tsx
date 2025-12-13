"use client";

import { useState } from 'react';
import { authAPI } from '@/services/api';

export default function TestLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Testing login with:', { email, password });
      const response = await authAPI.login({ email, password });
      console.log('Test login response:', response);
      setResult(response);
    } catch (err: any) {
      console.error('Test login error:', err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Login API Test</h1>
        
        <form onSubmit={handleTestLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
            <h3 className="font-medium">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded">
            <h3 className="font-medium">Success:</h3>
            <pre className="mt-2 text-xs overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Debugging Tips:</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
            <li>Check the browser console for detailed logs</li>
            <li>Make sure the backend server is running</li>
            <li>Verify your email and password are correct</li>
            <li>Try creating a new account if existing ones don't work</li>
          </ul>
        </div>
      </div>
    </div>
  );
}