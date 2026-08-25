'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-square bg-neutral-100 relative">
          {product.images && product.images.length > 0 ? (
            <Image src={product.images[0].imageUrl} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400 text-4xl">📷</div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-neutral-900 mb-1 truncate group-hover:text-primary-600 transition-colors">{product.name}</h3>
          <p className="text-sm text-neutral-500 mb-2 truncate">{product.category?.name || 'Uncategorized'}</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary-600">{formatPrice(product.price)}</p>
            {product.stockQuantity > 0 ? (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">In Stock</span>
            ) : (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
