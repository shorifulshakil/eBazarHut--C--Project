'use client';

import { useState, useEffect } from 'react';
import { dealerApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, EmptyState, Badge, Pagination } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import type { Order, PaginatedResponse } from '@/types';

function DealerOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await dealerApi.getOrders({ page: currentPage, pageSize: 10 });
        const data = response.data as PaginatedResponse<Order>;
        setOrders(data.items);
        setTotalPages(Math.ceil(data.total / (data.pageSize || 10)));
      } catch {
        // error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-neutral-900">Orders</h2>
      {orders.length === 0 ? (
        <EmptyState icon="📋" title="No orders yet" description="Orders containing your products will appear here." />
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{order.items.length} item(s)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge status={order.status} /></td>
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
    </div>
  );
}

export default function DealerOrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
      <DashboardLayout allowedRoles={['Dealer']} title="Orders">
        <DealerOrdersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
