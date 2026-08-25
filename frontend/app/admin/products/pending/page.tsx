'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, EmptyState, Badge, Pagination, ConfirmDialog } from '@/components/ui';
import toast from 'react-hot-toast';
import type { Product, PaginatedResponse } from '@/types';

function PendingProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await adminApi.getPendingProducts({ page: currentPage, pageSize: 10 });
        const data = response.data as PaginatedResponse<Product>;
        setProducts(data.items);
        setTotalPages(Math.ceil(data.total / data.pageSize));
      } catch {
        // error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage]);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product approved');
    } catch {
      toast.error('Failed to approve product');
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setIsRejecting(true);
    try {
      await adminApi.rejectProduct(rejectId, { rejectionReason });
      setProducts((prev) => prev.filter((p) => p.id !== rejectId));
      setRejectId(null);
      setRejectionReason('');
      toast.success('Product rejected');
    } catch {
      toast.error('Failed to reject product');
    } finally {
      setIsRejecting(false);
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
      <h2 className="text-xl font-semibold text-neutral-900">Pending Products</h2>
      {products.length === 0 ? (
        <EmptyState icon="✅" title="No pending products" description="All products have been reviewed." />
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Dealer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{product.dealer?.shopName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge status={product.approvalStatus} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button size="sm" variant="primary" onClick={() => handleApprove(product.id)} className="mr-2">Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => { setRejectId(product.id); setRejectionReason(''); }}>Reject</Button>
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
        isOpen={!!rejectId}
        onClose={() => setRejectId(null)}
        onConfirm={handleReject}
        title="Reject Product"
        description={
          <div>
            <p className="mb-2">Please provide a reason for rejecting this product:</p>
            <textarea
              className="w-full border border-neutral-300 rounded-md p-2 text-sm"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Rejection reason..."
            />
          </div>
        }
        confirmText="Reject"
        isLoading={isRejecting}
      />
    </div>
  );
}

export default function PendingProductsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <DashboardLayout allowedRoles={['Admin']} title="Pending Products">
        <PendingProductsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
