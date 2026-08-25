'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customerApi } from '@/services/api';
import { useAuth } from '@/features/auth';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Button, Spinner, EmptyState, Table, Badge, Pagination } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import type { Cart, PaginatedResponse } from '@/types';

function CartContent() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const response = await customerApi.getCart();
      setCart(response.data);
    } catch {
      setError('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await customerApi.updateCartItem(itemId, quantity);
      fetchCart();
    } catch {
      // error handled silently
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await customerApi.removeCartItem(itemId);
      fetchCart();
    } catch {
      // error handled silently
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-red-600">{error}</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Looks like you haven't added any products yet."
          action={
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6 font-heading">Shopping Cart</h1>
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <Table
          headers={['Product', 'Price', 'Quantity', 'Subtotal', '']}
          isLoading={isLoading}
        >
          {cart.items.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-neutral-100 rounded-md flex items-center justify-center text-xl">📷</div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-neutral-900">{item.productName}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{formatPrice(item.priceAtAdd)}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 rounded border border-neutral-300 flex items-center justify-center hover:bg-neutral-50">-</button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded border border-neutral-300 flex items-center justify-center hover:bg-neutral-50">+</button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">{formatPrice(item.subtotal)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-700">Remove</Button>
              </td>
            </tr>
          ))}
        </Table>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Link href="/products"><Button variant="outline">Continue Shopping</Button></Link>
        <div className="text-right">
          <p className="text-lg font-bold text-neutral-900">Total: {formatPrice(cart.totalAmount)}</p>
          <Link href="/checkout"><Button className="mt-2">Proceed to Checkout</Button></Link>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute allowedRoles={['Customer']}>
      <CartContent />
    </ProtectedRoute>
  );
}
