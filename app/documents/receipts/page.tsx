'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, List, LayoutGrid, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Receipt {
  id: string;
  reference_no: string;
  from?: string;
  to?: string;
  supplier: string;
  scheduled_date: string;
  status: string;
}

export default function ReceiptsPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetch('/api/documents?type=RECEIPT')
      .then((r) => r.json())
      .then((data) => {
        setReceipts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredReceipts = receipts.filter(
    (receipt) =>
      receipt.reference_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sample data from wireframe
  const sampleData: Receipt[] = [
    { 
      id: '1', 
      reference_no: 'WH/IN/0001', 
      from: 'vendor', 
      to: 'WH/Stock1', 
      supplier: 'Azure Interior', 
      scheduled_date: '', 
      status: 'Ready' 
    },
    { 
      id: '2', 
      reference_no: 'WH/IN/0002', 
      from: 'vendor', 
      to: 'WH/Stock1', 
      supplier: 'Azure Interior', 
      scheduled_date: '', 
      status: 'Ready' 
    },
  ];

  const displayData = filteredReceipts.length > 0 ? filteredReceipts : sampleData;

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      case 'READY':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'DONE':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Red separator line below navbar */}
      <div className="border-t-4 border-red-500"></div>

      {/* Main Container */}
      <div className="p-6">
        {/* MAIN CONTENT AREA */}
        <div className="w-full">
          
          {/* Page Action Header */}
          <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm mb-6">
            {/* Header Row */}
            <div className="flex items-center justify-between px-6 py-4">
              {/* Left: NEW Button */}
              <Button 
                onClick={() => router.push('/documents/receipts/create')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
              >
                NEW
              </Button>

              {/* Center: Page Title */}
              <h1 className="text-2xl font-bold text-gray-900">Reciepts</h1>

              {/* Right: Action Group */}
              <div className="flex items-center gap-3">
                {/* Search Icon with Tooltip */}
                <div className="relative group">
                  <button className="p-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors">
                    <Search className="h-5 w-5 text-gray-600" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Allow user to search receptive based on reference & contacts
                  </div>
                </div>

                {/* List View Icon */}
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    viewMode === 'list' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-5 w-5 text-gray-600" />
                </button>

                {/* Kanban View Icon with Tooltip */}
                <div className="relative group">
                  <button 
                    onClick={() => setViewMode('kanban')}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      viewMode === 'kanban' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <LayoutGrid className="h-5 w-5 text-gray-600" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Allow user to switch to the kanban view based on status
                  </div>
                </div>
              </div>
            </div>

            {/* Separator Line */}
            <div className="border-t-2 border-gray-300"></div>
          </div>

          {/* DATA TABLE */}
          {viewMode === 'list' ? (
            <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">Reference</th>
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">From</th>
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900 relative">
                    To
                    {/* Annotation for "Locations of warehouse" */}
                    <span className="absolute -top-6 left-0 text-xs font-normal text-purple-600 italic">
                      ↓ Locations of warehouse
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">Contact</th>
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">Schedule date</th>
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">Status</th>
                </tr>
                {/* Solid separator below header */}
                <tr>
                  <td colSpan={6} className="border-t-4 border-gray-800"></td>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {displayData.map((receipt, index) => (
                  <React.Fragment key={receipt.id}>
                    <tr 
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/documents/${receipt.id}`)}
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {receipt.reference_no}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {receipt.from || 'vendor'}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {receipt.to || 'WH/Stock1'}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {receipt.supplier}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {receipt.scheduled_date ? new Date(receipt.scheduled_date).toLocaleDateString() : ''}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(receipt.status)}>
                          {receipt.status}
                        </Badge>
                      </td>
                    </tr>
                    {/* Row separator line */}
                    <tr>
                      <td colSpan={6} className="border-t border-gray-200"></td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          ) : (
            // Kanban View
            <div className="grid grid-cols-3 gap-4">
              {/* Draft Column */}
              <div className="rounded-lg border-2 border-gray-300 bg-gray-50">
                <div className="border-b-2 border-gray-300 bg-gray-200 px-4 py-3">
                  <h3 className="font-semibold text-gray-900">Draft</h3>
                </div>
                <div className="space-y-2 p-3">
                  {displayData.filter((r) => r.status === 'Draft').map((receipt) => (
                    <div
                      key={receipt.id}
                      className="cursor-pointer rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/documents/${receipt.id}`)}
                    >
                      <p className="font-medium text-gray-900">{receipt.reference_no}</p>
                      <p className="text-sm text-gray-600">{receipt.supplier}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ready Column */}
              <div className="rounded-lg border-2 border-blue-300 bg-blue-50">
                <div className="border-b-2 border-blue-300 bg-blue-200 px-4 py-3">
                  <h3 className="font-semibold text-blue-900">Ready</h3>
                </div>
                <div className="space-y-2 p-3">
                  {displayData.filter((r) => r.status === 'Ready').map((receipt) => (
                    <div
                      key={receipt.id}
                      className="cursor-pointer rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/documents/${receipt.id}`)}
                    >
                      <p className="font-medium text-gray-900">{receipt.reference_no}</p>
                      <p className="text-sm text-gray-600">{receipt.supplier}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Done Column */}
              <div className="rounded-lg border-2 border-green-300 bg-green-50">
                <div className="border-b-2 border-green-300 bg-green-200 px-4 py-3">
                  <h3 className="font-semibold text-green-900">Done</h3>
                </div>
                <div className="space-y-2 p-3">
                  {displayData.filter((r) => r.status === 'Done').map((receipt) => (
                    <div
                      key={receipt.id}
                      className="cursor-pointer rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/documents/${receipt.id}`)}
                    >
                      <p className="font-medium text-gray-900">{receipt.reference_no}</p>
                      <p className="text-sm text-gray-600">{receipt.supplier}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

