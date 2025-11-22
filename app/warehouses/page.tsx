'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp } from 'lucide-react';

interface Warehouse {
  id: string;
  name: string;
  short_code: string;
  address?: string;
}

export default function WarehousesPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetch('/api/warehouses')
      .then((r) => r.json())
      .then(setWarehouses);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, short_code: shortCode, address }),
      });
      if (res.ok) {
        alert('Warehouse created successfully');
        setName('');
        setShortCode('');
        setAddress('');
        // Refresh list
        const data = await fetch('/api/warehouses').then((r) => r.json());
        setWarehouses(data);
      }
    } catch (err) {
      alert('Error creating warehouse');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Global Annotation - Top Note */}
      <div className="relative p-6">
       

        {/* Main Application Container with Red Outline */}
        <div className="relative mx-auto max-w-4xl rounded-2xl border-4 border-red-500 bg-white p-8">
          {/* Top Navigation Bar */}
          <div className="mb-4 flex items-center justify-between">
            
          </div>

          {/* Solid Red Horizontal Separator */}
          <div className="mb-6 border-t-2 border-red-500"></div>

          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Warehouse</h1>
          </div>

          {/* Solid Red Horizontal Line Below Title */}
          <div className="mb-8 border-t-2 border-red-500"></div>

          {/* Form Area - Warehouse Details */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Input Field: Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-b-2 border-gray-400 bg-transparent px-0 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
                placeholder=""
                required
              />
            </div>

            {/* Input Field: Short Code (with emphasis) */}
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-gray-700">Short Code:</label>
              <input
                type="text"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                className="w-full border-b-2 border-gray-400 bg-transparent px-0 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
                placeholder=""
                required
              />
            </div>

            {/* Input Field: Address */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Address:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border-b-2 border-gray-400 bg-transparent px-0 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
                placeholder=""
              />
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button 
                type="submit" 
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Warehouse
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
