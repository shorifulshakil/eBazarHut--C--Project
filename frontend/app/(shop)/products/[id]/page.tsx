'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { publicApi } from '@/services/api';
import { Button, Spinner, Badge, EmptyState } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await publicApi.getProduct(params.id as string);
        setProduct(response.data);
      } catch {
        setError('Product not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState icon="😕" title="Product not found" description={error || 'The product you are looking for does not exist.'} />
        <div className="text-center mt-4">
          <Link href="/products"><Button>Back to Products</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex mb-6 text-sm text-neutral-500">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-primary-600">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].imageUrl}
              alt={product.name}
              className="w-full aspect-square object-cover rounded-lg bg-neutral-100"
            />
          ) : (
            <div className="w-full aspect-square bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 text-4xl">
              📷
            </div>
          )}
        </div>
        <div>
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-neutral-900 font-heading">{product.name}</h1>
            <Badge status={product.approvalStatus} />
          </div>
          <p className="text-3xl font-bold text-primary-600 mb-4">{formatPrice(product.price)}</p>
          <p className="text-neutral-600 mb-6">{product.description || 'No description available.'}</p>
          <div className="space-y-2 mb-6 text-sm text-neutral-600">
            <p><strong>Stock:</strong> {product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of stock'}</p>
            <p><strong>Category:</strong> {product.category?.name || 'N/A'}</p>
            <p><strong>Seller:</strong> {product.dealer?.shopName || 'N/A'}</p>
            {product.publishedAt && <p><strong>Published:</strong> {formatDate(product.publishedAt)}</p>}
          </div>
          {user?.role === 'Customer' && product.stockQuantity > 0 && (
            <Button size="lg" className="w-full">Add to Cart</Button>
          )}
          {product.stockQuantity === 0 && (
            <Button size="lg" className="w-full" disabled>Out of Stock</Button>
          )}
        </div>
      </div>
    </div>
  );
}
