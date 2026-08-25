'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { dealerApi, publicApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Input, Select, Card, CardBody, CardFooter } from '@/components/ui';
import type { Category, Product } from '@/types';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    sku: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          dealerApi.getProduct(params.id as string),
          publicApi.getCategories(),
        ]);
        const product = productRes.data;
        if (product) {
          setFormData({
            name: product.name,
            description: product.description || '',
            price: String(product.price),
            stockQuantity: String(product.stockQuantity),
            categoryId: product.categoryId,
            sku: product.sku || '',
          });
        }
        setCategories(categoriesRes.data);
      } catch {
        toast.error('Failed to load product');
      }
    };
    fetchData();
  }, [params.id]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.stockQuantity || Number(formData.stockQuantity) < 0) newErrors.stockQuantity = 'Stock must be 0 or greater';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await dealerApi.updateProduct(params.id as string, {
        name: formData.name,
        description: formData.description || undefined,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        categoryId: formData.categoryId,
        sku: formData.sku || undefined,
      });
      toast.success('Product updated successfully!');
      router.push('/dealer/products');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
      <DashboardLayout allowedRoles={['Dealer']} title="Edit Product">
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
              <Input label="Product Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} error={errors.name} required />
              <Input label="Price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} error={errors.price} required />
              <Input label="Stock Quantity" type="number" value={formData.stockQuantity} onChange={(e) => setFormData((prev) => ({ ...prev, stockQuantity: e.target.value }))} error={errors.stockQuantity} required />
              <Select label="Category" value={formData.categoryId} onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))} options={categories.map((c) => ({ value: c.id, label: c.name }))} error={errors.categoryId} required />
              <Input label="SKU (optional)" value={formData.sku} onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))} />
              <Input label="Description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
            </form>
          </CardBody>
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={isLoading}>Update Product</Button>
          </CardFooter>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
