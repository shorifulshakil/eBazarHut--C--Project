import Link from 'next/link';
import { Button } from '@/components/ui';
import { Navbar } from '@/components/layout/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading leading-tight">
              Discover Unique Products from Independent Dealers
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl">
              Shop from a curated marketplace of trusted vendors. Every purchase supports small businesses and independent creators.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-neutral-100">
                  Browse Products
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12 font-heading">Why ShopHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Verified Dealers</h3>
              <p className="text-neutral-600">Every dealer is reviewed and approved to ensure quality and reliability.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
              <p className="text-neutral-600">Your transactions are protected with industry-standard security.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
              <p className="text-neutral-600">Track your orders in real-time with reliable shipping partners.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4 font-heading">Ready to start shopping?</h2>
          <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
            Join thousands of customers finding unique products from independent dealers.
          </p>
          <Link href="/products">
            <Button size="lg">Explore Products</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
