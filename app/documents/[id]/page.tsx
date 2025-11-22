'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Info, ChevronDown } from 'lucide-react';

interface DocumentLine {
  id: string;
  product_id: string;
  qty_expected: number;
  qty_done: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

interface Document {
  id: string;
  doc_type: string;
  status: string;
  reference_no: string;
  supplier?: string;
  customer?: string;
  scheduled_date: string;
  responsible?: string;
  notes?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  on_hand?: number;
  free_to_use?: number;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [doc, setDoc] = useState<Document | null>(null);
  const [lines, setLines] = useState<DocumentLine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [validating, setValidating] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (id) {
      // Fetch document
      fetch(`/api/documents/${id}`)
        .then((r) => r.json())
        .then(data => setDoc(data || null))
        .catch(err => { console.error('Failed to fetch document:', err); setDoc(null) });
      
      // Fetch document lines with product details
      fetch(`/api/document-lines?document_id=${id}`)
        .then((r) => r.json())
        .then(data => setLines(Array.isArray(data) ? data : []))
        .catch(err => { console.error('Failed to fetch document lines:', err); setLines([]) });
      
      // Fetch all products for dropdown
      fetch('/api/products')
        .then((r) => r.json())
        .then(data => setProducts(Array.isArray(data) ? data : []))
        .catch(err => { console.error('Failed to fetch products:', err); setProducts([]) });
    }
  }, [id]);

  async function handleValidate() {
    if (!doc) return;
    setValidating(true);
    try {
      const res = await fetch(`/api/documents/${id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_type: doc.doc_type }),
      });
      if (!res.ok) throw new Error('Failed to validate');
      alert('Document validated successfully');
      window.location.reload();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setValidating(false);
    }
  }

  function handlePrint() {
    if (doc?.status !== 'DONE') {
      alert('Document must be in DONE status to print');
      return;
    }
    // Trigger browser print dialog
    window.print();
  }

  async function handleCancel() {
    if (!doc) return;
    const confirmed = window.confirm('Are you sure you want to cancel this document? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (!res.ok) throw new Error('Failed to cancel document');
      alert('Document cancelled successfully');
      router.back();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleAddProduct() {
    if (!selectedProductId || !quantity) {
      alert('Please select a product and enter quantity');
      return;
    }

    try {
      const res = await fetch('/api/document-lines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: id,
          product_id: selectedProductId,
          qty_expected: parseFloat(quantity),
          qty_done: parseFloat(quantity)
        }),
      });

      if (!res.ok) throw new Error('Failed to add product');
      
      // Refresh lines
      const linesRes = await fetch(`/api/document-lines?document_id=${id}`);
      const linesData = await linesRes.json();
      setLines(linesData);
      
      // Reset form
      setShowAddProduct(false);
      setSelectedProductId('');
      setQuantity('1');
      
      alert('Product added successfully');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  if (!doc) return <div className="p-6">Loading...</div>;

  const isReceipt = doc.doc_type === 'RECEIPT';
  const isDelivery = doc.doc_type === 'DELIVERY';

  return (
    <div className="min-h-screen bg-white">
      {/* Red Separator Line */}
      <div className="border-t-4 border-red-500"></div>

      {/* Main Layout with Annotation Panels */}
      <div className="flex gap-6 p-6">
        {/* Left Logic Panel - Only for Receipts */}
        {isReceipt && (
          <div className="w-64 flex-shrink-0 space-y-4">
            <div className="rounded-lg border-2 border-purple-300 bg-purple-50 p-4">
              <div className="space-y-2 text-sm text-purple-900">
                <p className="font-semibold">State Transition Rules:</p>
                <p>To DO = When in Draft</p>
                <p>Validate = When in Ready</p>
                <p className="mt-3 text-xs text-purple-700">On click, TODO, move to Ready</p>
                <p className="text-xs text-purple-700">onclick, Validate move to Done</p>
              </div>
              <div className="mt-3 flex justify-center">
                <ArrowRight className="h-6 w-6 text-purple-500" style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>

            {/* Print Logic */}
            <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
              <div className="space-y-2 text-sm text-blue-900">
                <p className="font-semibold">Print Logic:</p>
                <p>Print the receipt once it's DONE</p>
              </div>
              <div className="mt-3 flex justify-center">
                <ArrowRight className="h-6 w-6 text-blue-500" style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>

            {/* Auto-fill Logic */}
            <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
              <div className="space-y-2 text-sm text-amber-900">
                <p className="font-semibold">Auto-fill Logic:</p>
                <p>Auto fill with the current logged in users.</p>
              </div>
              <div className="mt-3 flex justify-center">
                <ArrowRight className="h-6 w-6 text-amber-500" style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Page Header */}
          <div className="mb-4 flex items-center gap-4">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">New</Button>
            <h1 className="text-2xl font-semibold">{isReceipt ? 'Receipt' : isDelivery ? 'Delivery' : doc.doc_type}</h1>
          </div>

          {/* Red Divider */}
          <div className="mb-6 border-t-2 border-red-500"></div>

          {/* Control & Status Bar */}
          <div className="mb-4 flex items-center justify-between">
            {/* Left Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleValidate}
                disabled={validating || doc.status === 'DONE'}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
              >
                {validating ? 'Validating...' : 'Validate'}
              </Button>
              <Button 
                onClick={handlePrint}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
              >
                Print
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline" 
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Cancel
              </Button>
            </div>

            {/* Right Status Widget - Pill-shaped Progress Bar */}
            <div className="flex items-center gap-2 rounded-full border-2 border-gray-300 bg-gray-50 px-6 py-2">
              <span className={`font-medium ${doc.status.toUpperCase() === 'DRAFT' ? 'text-gray-900' : 'text-gray-400'}`}>
                Draft
              </span>
              <span className="text-gray-400">{'>'}</span>
              {isDelivery && (
                <>
                  <span className={`font-medium ${doc.status.toUpperCase() === 'WAITING' ? 'text-yellow-600' : 'text-gray-400'}`}>
                    Waiting
                  </span>
                  <span className="text-gray-400">{'>'}</span>
                </>
              )}
              <span className={`font-medium ${doc.status.toUpperCase() === 'READY' ? 'text-blue-600' : 'text-gray-400'}`}>
                Ready
              </span>
              <span className="text-gray-400">{'>'}</span>
              <span className={`font-medium ${doc.status.toUpperCase() === 'DONE' ? 'text-green-600' : 'text-gray-400'}`}>
                Done
              </span>
            </div>
          </div>

          {/* Divider under status bar */}
          <div className="mb-6 border-t-2 border-gray-300"></div>

          {/* Form Area - Document Details */}
          <div className="space-y-6">
            {/* Document Reference Header */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{doc.reference_no || (isReceipt ? 'WH/IN/0001' : 'WH/OUT/0001')}</h2>
            </div>

            {/* Input Fields - Underline Style */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {isReceipt ? 'Receive From' : 'Delivery Adress'}
                </label>
                <input
                  type="text"
                  value={isReceipt ? (doc.supplier || '') : (doc.customer || '')}
                  className="w-full border-b-2 border-gray-300 bg-transparent px-0 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
                  readOnly
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Schedule Date</label>
                <input
                  type="date"
                  value={doc.scheduled_date?.split('T')[0] || ''}
                  className="w-full border-b-2 border-gray-300 bg-transparent px-0 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <label className="mb-1 block text-sm font-medium text-gray-700">Responsible</label>
                <input
                  type="text"
                  value={doc.responsible || 'Admin'}
                  className="w-full border-b-2 border-gray-300 bg-transparent px-0 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
                  readOnly
                />
              </div>
              {isDelivery && (
                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Operation type</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={doc.doc_type}
                      className="w-full border-b-2 border-gray-300 bg-transparent px-0 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
                      readOnly
                    />
                    <ChevronDown className="absolute right-0 top-2 h-5 w-5 text-gray-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Product Table Section */}
            <div className="mt-8">
              {/* Section Header */}
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Products</h3>

              {/* Table */}
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="pb-3 text-left text-sm font-semibold text-gray-900">Product</th>
                      <th className="pb-3 text-right text-sm font-semibold text-gray-900">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Actual product lines from database */}
                    {Array.isArray(lines) && lines.map((line) => (
                      <tr key={line.id} className="border-b-2 border-gray-900">
                        <td className="py-4 text-sm text-gray-900">
                          {line.product ? `[${line.product.sku}] ${line.product.name}` : `Product ${line.product_id}`}
                        </td>
                        <td className="py-4 text-right text-sm text-gray-900">
                          {line.qty_done || line.qty_expected}
                        </td>
                      </tr>
                    ))}

                    {/* Sample Row - [DESK001] Desk */}
                    {lines.length === 0 && (
                      <tr className="border-b-2 border-gray-900">
                        <td className="py-4 text-sm text-gray-900">[DESK001] Desk</td>
                        <td className="relative py-4 text-right text-sm text-gray-900">
                          6
                          {isDelivery && (
                            <div className="absolute -top-8 right-0 text-xs text-orange-600">
                              <ArrowRight className="ml-auto h-4 w-4" style={{ transform: 'rotate(90deg)' }} />
                            </div>
                          )}
                        </td>
                      </tr>
                    )}

                    {/* Add Product Action Row */}
                    {doc?.status === 'Draft' && (
                      <>
                        {showAddProduct ? (
                          <tr className="border-b-2 border-gray-900">
                            <td className="py-4">
                              <select
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                className="w-full rounded border-2 border-gray-300 px-3 py-2"
                              >
                                <option value="">Select Product</option>
                                {Array.isArray(products) && products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    [{p.sku}] {p.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2 items-center justify-end">
                                <input
                                  type="number"
                                  value={quantity}
                                  onChange={(e) => setQuantity(e.target.value)}
                                  min="1"
                                  className="w-20 rounded border-2 border-gray-300 px-3 py-2 text-right"
                                />
                                <Button size="sm" onClick={handleAddProduct}>Add</Button>
                                <Button size="sm" variant="outline" onClick={() => setShowAddProduct(false)}>
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr className="border-b-2 border-gray-900">
                            <td colSpan={2} className="relative py-4">
                              <button 
                                onClick={() => setShowAddProduct(true)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                              >
                                New Product
                              </button>
                              {isDelivery && (
                                <div className="absolute left-0 top-12 flex flex-col items-center">
                                  <div className="h-8 border-l-2 border-dotted border-green-500"></div>
                                  <p className="mt-2 text-xs text-green-700">Add New product</p>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Definition Panel - Different for Receipt vs Delivery */}
        <div className="w-64 flex-shrink-0">
          <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
            <div className="space-y-2 text-sm text-green-900">
              <p className="font-semibold">Status Definitions:</p>
              {isReceipt ? (
                <>
                  <p><strong>Draft</strong> - Initial stage</p>
                  <p><strong>Ready</strong> - Ready to receive</p>
                  <p><strong>Done</strong> - Recieved</p>
                </>
              ) : (
                <>
                  <p><strong>Draft:</strong> Initial state</p>
                  <p><strong>Waiting:</strong> Waiting for the out of stock product to be in</p>
                  <p><strong>Ready:</strong> Ready to deliver/receive</p>
                  <p><strong>Done:</strong> Received or delivered</p>
                </>
              )}
            </div>
            <div className="mt-3 flex justify-center">
              <ArrowRight className="h-6 w-6 text-green-500" style={{ transform: 'rotate(180deg)' }} />
            </div>
          </div>

          {/* Stock Availability Logic - Only for Delivery */}
          {isDelivery && (
            <div className="mt-4 rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
              <div className="space-y-2 text-sm text-orange-900">
                <p className="font-semibold">Stock Availability:</p>
                <p>Alert the notification & mark the line red if product is not in stock.</p>
              </div>
              <div className="mt-3 flex justify-center">
                <ArrowRight className="h-6 w-6 text-orange-500" style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
