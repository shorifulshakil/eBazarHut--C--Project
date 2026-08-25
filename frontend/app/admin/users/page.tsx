'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, EmptyState, Badge, Pagination, ConfirmDialog } from '@/components/ui';
import type { User, PaginatedResponse } from '@/types';

function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusId, setStatusId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminApi.getUsers({ page: currentPage, pageSize: 10 });
        const data = response.data as PaginatedResponse<User>;
        setUsers(data.items);
        setTotalPages(Math.ceil(data.total / data.pageSize));
      } catch {
        // error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage]);

  const handleStatusChange = async () => {
    if (!statusId) return;
    setIsUpdating(true);
    try {
      await adminApi.updateUserStatus(statusId, { isActive: newStatus });
      setUsers((prev) => prev.map((u) => u.id === statusId ? { ...u, isActive: newStatus } : u));
      setStatusId(null);
    } catch {
      // error handled silently
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-neutral-900">Users</h2>
      {users.length === 0 ? (
        <EmptyState icon="👥" title="No users found" />
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button onClick={() => { setStatusId(user.id); setNewStatus(!user.isActive); }} className="text-primary-600 hover:text-primary-700">
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-neutral-200">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!statusId}
        onClose={() => setStatusId(null)}
        onConfirm={handleStatusChange}
        title={newStatus ? 'Activate User' : 'Deactivate User'}
        description={`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this user?`}
        variant={newStatus ? 'primary' : 'danger'}
        isLoading={isUpdating}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <DashboardLayout allowedRoles={['Admin']} title="Users">
        <UsersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
