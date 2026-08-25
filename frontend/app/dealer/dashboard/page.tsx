'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dealerApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Card, CardBody, Spinner, EmptyState, Badge, Pagination } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import type { Product, PaginatedResponse } from '@/types';

function DealerDashboardContent() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dealerApi.getProducts({ pageSize: 5 });
        const data = response.data as PaginatedResponse<Product>;
        const products = data.items;
        setRecentProducts(products);
        setStats({
          total: data.total,
          pending: products.filter((p) => p.approvalStatus === 'Pending').length,
          approved: products.filter((p) => p.approvalStatus === 'Approved').length,
          rejected: products.filter((p) => p.approvalStatus === 'Rejected').length,
        });
      } catch {
        // error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Products', value: stats.total, color: 'bg-primary-50 text-primary-700' },
    { label: 'Pending Approval', value: stats.pending, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Approved', value: stats.approved, color: 'bg-green-50 text-green-700' },
    { label: 'Rejected', value: stats.rejected, color: 'bg-red-50 text-red-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <p className="text-sm text-neutral-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color} px-2 py-1 rounded inline-block`}>{stat.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Products</h2>
            <Link href="/dealer/products"><Button size="sm">View All</Button></Link>
          </div>
          {recentProducts.length === 0 ? (
            <EmptyState icon="📦" title="No products yet" description="Create your first product to get started." action={<Link href="/dealer/products/new"><Button size="sm">New Product</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-neutral-900">{product.name}</p>
                    <p className="text-sm text-neutral-500">{formatPrice(product.price)}</p>
                  </div>
                  <Badge status={product.approvalStatus} />
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function DealerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
      <DashboardLayout allowedRoles={['Dealer']} title="Dealer Dashboard">
        <DealerDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
