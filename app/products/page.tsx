'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string;
  unit_cost?: number;
  on_hand?: number;
  free_to_use?: number;
}

export default function StockPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sample data from wireframe (will be replaced by actual data)
  const sampleData = [
    { name: 'Desk', unit_cost: 3000, on_hand: 50, free_to_use: 45 },
    { name: 'Table', unit_cost: 3000, on_hand: 50, free_to_use: 50 },
  ];

  // Merge sample data with actual data (prioritize actual data)
  const displayData = filteredProducts.length > 0 ? filteredProducts : sampleData.map((item, idx) => ({
    id: `sample-${idx}`,
    name: item.name,
    sku: `SKU-${idx}`,
    unit_cost: item.unit_cost,
    on_hand: item.on_hand,
    free_to_use: item.free_to_use
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Page Header with Title and Search */}
      <div className="border-b bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Stock</h1>
          
          {/* Search Icon (Top Right) */}
          <div 
            className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-5 w-5 text-gray-600" />
          </div>
        </div>
        {/* Header Separator */}
        <div className="border-t-2 border-gray-200"></div>

        {/* Search Input */}
        {showSearch && (
          <div className="px-6 py-4 border-t">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-md border-2 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <Button
                variant="outline"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Container */}
      <div className="p-6">
        <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
          
          {/* Stock Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">per unit cost</th>
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">On hand</th>
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">free to Use</th>
                </tr>
                {/* Thick solid line under header */}
                <tr>
                  <td colSpan={4} className="border-t-4 border-gray-800"></td>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {/* Row 1: Desk */}
                <tr className="hover:bg-green-50 cursor-pointer transition-colors" onClick={() => displayData[0] && router.push(`/products/${displayData[0].id}`)}>
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {displayData[0]?.name || 'Desk'}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {displayData[0]?.unit_cost || 3000} Rs
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {displayData[0]?.on_hand || 50}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {displayData[0]?.free_to_use || 45}
                  </td>
                </tr>
                {/* Dotted separator */}
                <tr>
                  <td colSpan={4} className="border-t-2 border-dotted border-gray-300"></td>
                </tr>

                {/* Row 2: Table */}
                <tr className="hover:bg-green-50 cursor-pointer transition-colors" onClick={() => displayData[1] && router.push(`/products/${displayData[1].id}`)}>
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {displayData[1]?.name || 'Table'}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {displayData[1]?.unit_cost || 3000} Rs
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {displayData[1]?.on_hand || 50}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {displayData[1]?.free_to_use || 50}
                  </td>
                </tr>
                {/* Dotted separator */}
                <tr>
                  <td colSpan={4} className="border-t-2 border-dotted border-gray-300"></td>
                </tr>

                {/* Row 3: Empty Placeholder Row */}
                <tr className="h-12">
                  <td colSpan={4} className="px-6 py-4 text-gray-400 text-center italic">
                    {/* Empty placeholder for additional items */}
                  </td>
                </tr>
                {/* Dotted separator */}
                <tr>
                  <td colSpan={4} className="border-t-2 border-dotted border-gray-300"></td>
                </tr>

                {/* Additional products from database */}
                {displayData.slice(2).map((product, index) => (
                  <React.Fragment key={product.id}>
                    <tr 
                      className="hover:bg-green-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-gray-800">
                        {product.unit_cost ? `${product.unit_cost} Rs` : '0 Rs'}
                      </td>
                      <td className="px-6 py-4 text-gray-800">{product.on_hand || 0}</td>
                      <td className="px-6 py-4 text-gray-800">{product.free_to_use || 0}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="border-t-2 border-dotted border-gray-300"></td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}


