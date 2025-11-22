'use client';

import React, { useState, useEffect } from 'react';

interface Location {
  id: string;
  name: string;
  short_code: string;
  warehouse_id: string;
}

interface Warehouse {
  id: string;
  name: string;
  short_code: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [warehouseId, setWarehouseId] = useState('');

  useEffect(() => {
    fetch('/api/warehouses')
      .then((r) => r.json())
      .then(setWarehouses);
    fetch('/api/locations')
      .then((r) => r.json())
      .then(setLocations);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          short_code: shortCode,
          warehouse_id: warehouseId,
        }),
      });
      if (res.ok) {
        alert('Location created successfully');
        setName('');
        setShortCode('');
        setWarehouseId('');
        // Refresh list
        const data = await fetch('/api/locations').then((r) => r.json());
        setLocations(data);
      }
    } catch (err) {
      alert('Error creating location');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative p-6">
        {/* Main UI Container with Red Outline */}
        <div className="relative mx-auto max-w-4xl rounded-2xl border-4 border-red-500 bg-white p-8">
         
          {/* Top Navigation Bar */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-6">
              
            </div>
            {/* Profile Avatar */}
           
          </div>

          {/* Solid Red Horizontal Line Under Navbar */}
          <div className="mb-6 border-t-2 border-red-500"></div>

          {/* Page Header - lowercase "location" */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Location</h1>
          </div>

          {/* Solid Red Horizontal Line Below Title */}
          <div className="mb-8 border-t-2 border-red-500"></div>

          {/* Form Area - Location Details */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Input Field 1: Name */}
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

            {/* Input Field 2: Short Code */}
            <div>
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

            {/* Input Field 3: warehouse (lowercase "w") */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">warehouse:</label>
              <input
                type="text"
                value={warehouseId || 'WH'}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full border-b-2 border-gray-400 bg-transparent px-0 py-2 text-center text-gray-900 focus:border-blue-600 focus:outline-none"
                placeholder="WH"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button 
                type="submit" 
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Location
              </button>
            </div>
          </form>

          {/* Body Content Area - Helper Text */}
          
        </div>
       
      </div>
    </div>
  );
}
