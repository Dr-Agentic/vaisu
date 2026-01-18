import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button, Card, Spinner } from '../components/primitives';
import { apiClient } from '../services/apiClient';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    !userId || !token ? 'error' : 'loading',
  );
  const [message, setMessage] = useState(
    !userId || !token ? 'Invalid verification link.' : '',
  );

  useEffect(() => {
    if (!userId || !token) return;

    const verify = async () => {
      try {
        await apiClient.verifyEmail(userId, token);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. The link may be expired.');
      }
    };

    verify();
  }, [userId, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md p-8 text-center bg-gray-800 border-gray-700 space-y-6">
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="lg" />
            <p className="text-gray-300">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
            <p className="text-gray-400">Your account has been successfully verified.</p>
            <Link to="/login">
              <Button variant="aurora" className="w-full">Continue to Login</Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-red-400">{message}</p>
            <Link to="/login">
              <Button variant="ghost" className="w-full">Back to Login</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
