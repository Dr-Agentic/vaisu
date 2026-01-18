
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, Input, Card } from '../components/primitives';
import { apiClient } from '../services/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await apiClient.requestPasswordReset(email);
      setStatus('success');
      setMessage(res.message || 'If an account exists, a reset link has been sent.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md p-8 space-y-8 bg-gray-800 border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
          <p className="mt-2 text-gray-400">Enter your email to receive a reset link</p>
        </div>

        {status === 'success' ? (
          <div className="text-center space-y-6">
            <div className="bg-green-900/20 text-green-400 p-4 rounded-lg">
              {message}
            </div>
            <Link to="/login">
              <Button variant="ghost" className="w-full">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jane@example.com"
            />

            {status === 'error' && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
                {message}
              </div>
            )}

            <Button
              type="submit"
              variant="aurora"
              className="w-full"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
