'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-primary-600 font-heading">
              ShopHub
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/products" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                Products
              </Link>
              {isAuthenticated && user?.role === 'Customer' && (
                <Link href="/cart" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Cart
                </Link>
              )}
              {isAuthenticated && user?.role === 'Dealer' && (
                <Link href="/dealer/dashboard" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Dealer Panel
                </Link>
              )}
              {isAuthenticated && user?.role === 'Admin' && (
                <Link href="/admin/dashboard" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-neutral-600 hidden sm:block">
                  Hello, {user?.fullName}
                </span>
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="gap-2">
                    {user?.role}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {user?.role === 'Customer' && (
                        <>
                          <Link href="/orders" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">My Orders</Link>
                          <Link href="/account" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Account</Link>
                        </>
                      )}
                      {user?.role === 'Dealer' && (
                        <>
                          <Link href="/dealer/products" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">My Products</Link>
                          <Link href="/dealer/orders" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Orders</Link>
                        </>
                      )}
                      {user?.role === 'Admin' && (
                        <>
                          <Link href="/admin/users" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Users</Link>
                          <Link href="/admin/products/pending" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Pending Products</Link>
                          <Link href="/admin/stats" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Stats</Link>
                        </>
                      )}
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
