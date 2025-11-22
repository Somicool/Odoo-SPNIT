'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, List, LayoutGrid, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Delivery {
  id: string;
  reference_no: string;
  customer: string;
  scheduled_date: string;
  status: string;
}

export default function DeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showSearch, setShowSearch] = useState(false);

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.reference_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetch('/api/documents?type=DELIVERY')
      .then((r) => r.json())
      .then((data) => {
        setDeliveries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative p-6">
        {/* Global Annotations - Navigation Logic */}
        

        {/* Main Application Container with Red Outline */}
        <div className="relative mx-auto max-w-7xl rounded-2xl border-4 border-red-500 bg-white p-8">
          
          

          {/* Solid Red Horizontal Line Under Navbar */}
          <div className="mb-6 border-t-2 border-red-500"></div>

          {/* Search Input */}
          {showSearch && (
            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by reference or customer..."
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
          )}

          {/* Page Action Header */}
          <div className="mb-4 flex items-center justify-between">
            {/* Left Side: NEW Button */}
            <div className="flex items-center gap-4">
              <Button 
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => router.push('/documents/deliveries/create')}
              >
                NEW
              </Button>
              
              {/* Page Title */}
              <h1 className="text-2xl font-semibold text-gray-900">Delivery</h1>
            </div>

            {/* Right Side: Controls */}
            <div className="flex items-center gap-3">
              {/* Search Icon with Tooltip */}
              <div className="group relative">
                <div 
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border-2 border-gray-300 hover:border-blue-500"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <Search className="h-5 w-5 text-gray-600" />
                </div>
                <div className="absolute right-0 top-12 hidden w-64 rounded-lg border-2 border-blue-300 bg-blue-50 p-3 text-xs text-blue-900 group-hover:block">
                  <p>Allow user to search Delivery based on reference & contacts</p>
                  <div className="absolute -top-2 right-4">
                    <ArrowRight className="h-4 w-4 text-blue-500" style={{ transform: 'rotate(-90deg)' }} />
                  </div>
                </div>
              </div>

              {/* List View Icon */}
              <div
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border-2 ${
                  viewMode === 'list' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-5 w-5 text-gray-600" />
              </div>

              {/* Kanban View Icon with Tooltip */}
              <div className="group relative">
                <div
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border-2 ${
                    viewMode === 'kanban' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                  }`}
                  onClick={() => setViewMode('kanban')}
                >
                  <LayoutGrid className="h-5 w-5 text-gray-600" />
                </div>
                <div className="absolute right-0 top-12 hidden w-64 rounded-lg border-2 border-green-300 bg-green-50 p-3 text-xs text-green-900 group-hover:block">
                  <p>Allow user to switch to the kanban view based on status</p>
                  <div className="absolute -top-2 right-4">
                    <ArrowRight className="h-4 w-4 text-green-500" style={{ transform: 'rotate(-90deg)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Solid Red Horizontal Line Below Action Header */}
          <div className="mb-6 border-t-2 border-red-500"></div>

          {/* Data Table Component */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-red-500">
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Reference</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">From</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">To</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Schedule date</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                      Loading deliveries...
                    </td>
                  </tr>
                ) : filteredDeliveries.length === 0 ? (
                  <tr>
                    
                  </tr>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <tr 
                      key={delivery.id} 
                      className="border-b-2 border-red-500 hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/documents/${delivery.id}`)}
                    >
                      <td className="py-4 text-sm text-gray-900">{delivery.reference_no}</td>
                      <td className="py-4 text-sm text-gray-900">-</td>
                      <td className="py-4 text-sm text-gray-900">-</td>
                      <td className="py-4 text-sm text-gray-900">{delivery.customer}</td>
                      <td className="py-4 text-sm text-gray-900">{delivery.scheduled_date || '-'}</td>
                      <td className="py-4 text-sm text-gray-900">{delivery.status}</td>
                    </tr>
                  ))
                )}
                {/* Sample Row */}
                <tr className="border-b-2 border-red-500 hover:bg-blue-50 transition-colors">
                  <td className="py-4 text-sm text-gray-900">WH/OUT/0001</td>
                  <td className="py-4 text-sm text-gray-900">WH/Stock1</td>
                  <td className="py-4 text-sm text-gray-900">vendor</td>
                  <td className="py-4 text-sm text-gray-900">Azure Interior</td>
                  <td className="py-4 text-sm text-gray-900"></td>
                  <td className="py-4 text-sm text-gray-900">Ready</td>
                </tr>

                {/* Row 2 */}
                <tr className="border-b-2 border-red-500">
                  <td className="py-4 text-sm text-gray-900">WH/OUT/0002</td>
                  <td className="py-4 text-sm text-gray-900">WH/Stock1</td>
                  <td className="py-4 text-sm text-gray-900">vendor</td>
                  <td className="py-4 text-sm text-gray-900">Azure Interior</td>
                  <td className="py-4 text-sm text-gray-900"></td>
                  <td className="py-4 text-sm text-gray-900">Ready</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Central Body Logic Note */}
        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-gray-600">Populate all delivery orders</p>
        </div>
      </div>
    </div>
  );
}
