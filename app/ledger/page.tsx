'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, List, LayoutGrid, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LedgerEntry {
  id: string;
  created_at: string;
  product_id: string;
  location_id: string;
  qty_delta: number;
  balance_after: number;
  reason: string;
  reference_no?: string;
  contact?: string;
}

export default function LedgerPage() {
  const router = useRouter();
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetch('/api/ledger')
      .then((r) => r.json())
      .then(setLedger);
  }, []);

  const filteredLedger = ledger.filter(
    (entry) =>
      (entry.reference_no?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (entry.contact?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      entry.product_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="relative p-6">
        {/* Global Annotations - Navigation Logic Notes */}
        <div className="mb-6 space-y-2 text-center">
          
        </div>

        {/* Main Application Container with Red Outline */}
        <div className="relative mx-auto max-w-7xl rounded-2xl border-4 border-red-500 bg-white p-8">
          {/* Top Navigation Bar */}
          <div className="mb-4 flex items-center justify-between">
          </div>

          {/* Search Input */}
          {showSearch && (
            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by reference, contact, or product..."
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
            {/* Left-side: NEW Button */}
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => alert('Create new move - Feature coming soon!')}
            >
              NEW
            </Button>

            {/* Center: Page Title */}
            <h1 className="text-2xl font-semibold text-gray-900">Move History</h1>

            {/* Right-side: Controls */}
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

          {/* Solid Red Horizontal Line Under Action Header */}
          <div className="mb-6 border-t-2 border-red-500"></div>

          {/* Data Table Component */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-red-500">
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Reference</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">From</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">To</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.length === 0 ? (
                  <tr>
                  
                  </tr>
                ) : (
                  filteredLedger.map((entry) => (
                    <tr 
                      key={entry.id} 
                      className={`border-b-2 border-red-500 hover:opacity-80 transition-opacity cursor-pointer ${
                        entry.qty_delta > 0 ? 'bg-green-50' : 'bg-red-50'
                      }`}
                      onClick={() => router.push(`/ledger/${entry.id}`)}
                    >
                      <td className="py-4 text-sm text-gray-900">{entry.reference_no || '-'}</td>
                      <td className="py-4 text-sm text-gray-900">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-sm text-gray-900">{entry.contact || '-'}</td>
                      <td className="py-4 text-sm text-gray-900">-</td>
                      <td className="py-4 text-sm text-gray-900">-</td>
                      <td className="py-4 text-sm text-gray-900">{entry.qty_delta}</td>
                      <td className="py-4 text-sm text-gray-900">{entry.reason}</td>
                    </tr>
                  ))
                )}
                {/* Sample Row 1 - IN move (green) */}
                <tr className="border-b-2 border-red-500 bg-green-50 hover:opacity-80 transition-opacity">
                  <td className="py-4 text-sm text-gray-900">WH/IN/0001</td>
                  <td className="py-4 text-sm text-gray-900">12/1/2001</td>
                  <td className="py-4 text-sm text-gray-900">Azure Interior</td>
                  <td className="py-4 text-sm text-gray-900">vendor</td>
                  <td className="py-4 text-sm text-gray-900">WH/Stock1</td>
                  <td className="py-4 text-sm text-gray-900"></td>
                  <td className="py-4 text-sm text-gray-900">Ready</td>
                </tr>

                {/* Sample Row 2 - OUT move (red/rend) */}
                <tr className="border-b-2 border-red-500 bg-red-50 hover:opacity-80 transition-opacity">
                  <td className="py-4 text-sm text-gray-900">WH/OUT/0002</td>
                  <td className="py-4 text-sm text-gray-900">12/1/2001</td>
                  <td className="py-4 text-sm text-gray-900">Azure Interior</td>
                  <td className="py-4 text-sm text-gray-900">WH/Stock1</td>
                  <td className="py-4 text-sm text-gray-900">vendor</td>
                  <td className="py-4 text-sm text-gray-900"></td>
                  <td className="py-4 text-sm text-gray-900">Ready</td>
                </tr>

                {/* Row 3 - OUT move (red/rend) */}
                <tr className="border-b-2 border-red-500 bg-red-50">
                  <td className="py-4 text-sm text-gray-900">WH/OUT/0002</td>
                  <td className="py-4 text-sm text-gray-900">12/1/2001</td>
                  <td className="py-4 text-sm text-gray-900">Azure Interior</td>
                  <td className="py-4 text-sm text-gray-900">WH/Stock2</td>
                  <td className="py-4 text-sm text-gray-900">vendor</td>
                  <td className="py-4 text-sm text-gray-900"></td>
                  <td className="py-4 text-sm text-gray-900">Ready</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        
      </div>
    </div>
  );
}
