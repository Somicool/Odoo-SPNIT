'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Info } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PageHeader title="Dashboard" />
      
      <div className="p-6 space-y-6">
        {/* Two Cards Side by Side */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          
          {/* Receipt Card */}
          <div className="rounded-lg border-2 border-blue-200 bg-white shadow-lg hover:shadow-xl transition-all overflow-hidden">
            <div className="border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900">Receipt</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Main Action Button */}
              <button
                onClick={() => router.push('/documents/receipts')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                4 to receive
              </button>
              
              {/* Right-aligned Stats */}
              <div className="flex flex-col items-end space-y-2">
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg font-semibold text-sm">
                  1 Late
                </div>
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg font-semibold text-sm">
                  6 operations
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Card */}
          <div className="rounded-lg border-2 border-green-200 bg-white shadow-lg hover:shadow-xl transition-all overflow-hidden">
            <div className="border-b-2 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900">Delivery</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Main Action Button */}
              <button
                onClick={() => router.push('/documents/deliveries')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                4 to Deliver
              </button>
              
              {/* Right-aligned Stats */}
              <div className="flex flex-col items-end space-y-2">
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg font-semibold text-sm">
                  1 Late
                </div>
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg font-semibold text-sm">
                  2 waiting
                </div>
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg font-semibold text-sm">
                  6 operations
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Explanation Box - CRITICAL REQUIREMENT */}
        <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-6 shadow-md">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-lg mb-3">Dashboard Explanation:</h4>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-start">
                  <span className="font-semibold text-red-700 min-w-[110px]">Late:</span>
                  <span>schedule date &lt; today's date</span>
                </p>
                <p className="flex items-start">
                  <span className="font-semibold text-blue-700 min-w-[110px]">Operations:</span>
                  <span>schedule date &gt; today's date</span>
                </p>
                <p className="flex items-start">
                  <span className="font-semibold text-yellow-700 min-w-[110px]">Waiting:</span>
                  <span>Waiting for the stocks</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


