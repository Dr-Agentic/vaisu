
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Button, Input, Card } from '../components/primitives';
import { apiClient } from '../services/apiClient';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!userId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <Card className="w-full max-w-md p-8 text-center bg-gray-800 border-gray-700">
          <h2 className="text-xl text-red-400">Invalid Link</h2>
          <p className="mt-2 text-gray-400">Missing required parameters.</p>
          <Link to="/login" className="mt-4 inline-block text-blue-400">Go to Login</Link>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage("Passwords don't match");
      return;
    }

    setStatus('loading');
    try {
      await apiClient.resetPassword(userId, token, password);
      setStatus('success');
      setTimeout(() => navigate('/login', { state: { message: 'Password reset successful. Please login.' } }), 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md p-8 space-y-8 bg-gray-800 border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Set New Password</h2>
        </div>

        {status === 'success' ? (
          <div className="text-center space-y-4">
            <div className="bg-green-900/20 text-green-400 p-4 rounded-lg">
              Password reset successfully! Redirecting to login...
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
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
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
