'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { publicApi } from '@/services/api';
import { useDebounce } from '@/hooks';
import { Button, Input, Select, Spinner, EmptyState, Pagination } from '@/components/ui';
import { ProductCard } from '@/features/products';
import type { Product, Category, PaginatedResponse } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [priceRange, setPriceRange] = useState({ min: searchParams.get('minPrice') || '', max: searchParams.get('maxPrice') || '' });

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await publicApi.getCategories();
        setCategories(response.data);
      } catch {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number | undefined> = {
          page: currentPage,
          pageSize: 12,
          sortBy,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedCategory) params.categoryId = selectedCategory;
        if (priceRange.min) params.minPrice = priceRange.min;
        if (priceRange.max) params.maxPrice = priceRange.max;

        const response = await publicApi.getProducts(params);
        const data = response.data as PaginatedResponse<Product>;
        setProducts(data.items);
        setTotalPages(Math.ceil(data.total / data.pageSize));
      } catch (err) {
        setError('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch, selectedCategory, sortBy, currentPage, priceRange.min, priceRange.max]);

  const updateSearchParams = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
      else params.delete(key);
    });
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-neutral-200 p-4 space-y-6">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Search</h3>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Category</h3>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Sort By</h3>
              <Select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'newest', label: 'Newest' },
                  { value: 'price_asc', label: 'Price: Low to High' },
                  { value: 'price_desc', label: 'Price: High to Low' },
                ]}
              />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Price Range</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => {
                    setPriceRange((prev) => ({ ...prev, min: e.target.value }));
                    setCurrentPage(1);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => {
                    setPriceRange((prev) => ({ ...prev, max: e.target.value }));
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSortBy('newest');
                setPriceRange({ min: '', max: '' });
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : products.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No products found"
              description="Try adjusting your filters or search query."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
