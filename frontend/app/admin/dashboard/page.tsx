'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, Card, CardBody } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import type { PlatformStats } from '@/types';

function AdminDashboardContent() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        setStats(response.data);
      } catch {
        // error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'text-primary-600' },
    { label: 'Dealers', value: stats.totalDealers, color: 'text-primary-600' },
    { label: 'Customers', value: stats.totalCustomers, color: 'text-primary-600' },
    { label: 'Products', value: stats.totalProducts, color: 'text-primary-600' },
    { label: 'Pending Products', value: stats.pendingProducts, color: 'text-yellow-600' },
    { label: 'Approved Products', value: stats.approvedProducts, color: 'text-green-600' },
    { label: 'Rejected Products', value: stats.rejectedProducts, color: 'text-red-600' },
    { label: 'Total Orders', value: stats.totalOrders, color: 'text-primary-600' },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), color: 'text-accent-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <CardBody>
            <p className="text-sm text-neutral-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <DashboardLayout allowedRoles={['Admin']} title="Admin Dashboard">
        <AdminDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
