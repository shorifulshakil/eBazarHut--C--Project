'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Button, Input, Card, CardBody, Spinner } from '@/components/ui';

function AccountContent() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    try {
      await refreshUser();
      setSuccess(true);
    } catch {
      // error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6 font-heading">My Account</h1>
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md">Profile updated successfully!</div>}
            <Input label="Email" type="email" value={user.email} disabled />
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Role:</span>
              <span className="text-sm font-medium text-neutral-900">{user.role}</span>
            </div>
            <Button type="submit" isLoading={isLoading}>Update Profile</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute allowedRoles={['Customer', 'Dealer', 'Admin']}>
      <AccountContent />
    </ProtectedRoute>
  );
}
