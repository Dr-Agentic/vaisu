import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Input, Card, Badge, Modal } from '../components/primitives';
import { apiClient } from '../services/apiClient';
import { useUserStore } from '../stores/userStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useUserStore();
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');

  // General Form State
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeTab === 'security') {
      loadSessions();
    }
  }, [activeTab]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await apiClient.getSessions();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to load sessions', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus('loading');
    try {
      await updateProfile(profileForm);
      setProfileStatus('success');
      setTimeout(() => setProfileStatus('idle'), 3000);
    } catch (error) {
      setProfileStatus('error');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus('error');
      setPasswordMsg("New passwords don't match");
      return;
    }
    setPasswordStatus('loading');
    try {
      await apiClient.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordStatus('success');
      setPasswordMsg('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordStatus('error');
      setPasswordMsg(error.response?.data?.error || 'Failed to change password');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiClient.revokeSession(sessionId);
      loadSessions();
    } catch (error) {
      console.error('Failed to revoke session', error);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await apiClient.deleteAccount(deletePassword);
      logout();
      navigate('/login');
    } catch (error: any) {
      setDeleteError(error.response?.data?.error || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center gap-2">
          ← Back to Dashboard
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user.firstName} {user.lastName}</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-gray-700">
        <button
          className={`pb-2 px-4 ${activeTab === 'general' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === 'security' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      {activeTab === 'general' && (
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-md">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
              />
              <Input
                label="Last Name"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-4">
              <Button type="submit" variant="aurora" disabled={profileStatus === 'loading'}>
                {profileStatus === 'loading' ? 'Saving...' : 'Save Changes'}
              </Button>
              {profileStatus === 'success' && <span className="text-green-400">Saved!</span>}
              {profileStatus === 'error' && <span className="text-red-400">Failed to save</span>}
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="space-y-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                required
              />
              <Input
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                required
              />

              {passwordMsg && (
                <div className={`text-sm ${passwordStatus === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                  {passwordMsg}
                </div>
              )}

              <Button type="submit" variant="aurora" disabled={passwordStatus === 'loading'}>
                {passwordStatus === 'loading' ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">Active Sessions</h2>
            {loadingSessions ? (
              <div className="text-gray-400">Loading sessions...</div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.sessionId} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{session.userAgent || 'Unknown Device'}</span>
                        {session.isCurrent && <Badge variant="success">Current</Badge>}
                      </div>
                      <div className="text-sm text-gray-400">
                        IP: {session.ipAddress} • Last active:{' '}
                        {new Date(session.lastActiveAt || session.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRevokeSession(session.sessionId)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-red-900/10 border border-red-900/50">
            <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
            <p className="text-gray-400 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </Button>
          </Card>
        </div>
      )}

      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to delete your account? All of your data will be permanently removed.
              This action cannot be undone.
            </p>
            <div className="bg-red-900/20 p-4 rounded border border-red-900/50">
              <p className="text-red-400 text-sm font-bold">
                Warning: This will immediately log you out and schedule your data for deletion.
              </p>
            </div>
            <div>
              <label htmlFor="delete-password" className="block text-sm font-medium text-gray-400 mb-1">Enter your password to confirm</label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
              />
            </div>
            {deleteError && <p className="text-red-400 text-sm">{deleteError}</p>}
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={!deletePassword || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
