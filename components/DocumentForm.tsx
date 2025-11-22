'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DocumentFormProps {
  docType: 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT'
}

export default function DocumentForm({ docType }: DocumentFormProps){
  const router = useRouter()
  const [referenceNo, setReferenceNo] = useState('')
  const [supplier, setSupplier] = useState('')
  const [customer, setCustomer] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<any[]>([{ product_id: '', qty_expected: 0, qty_done: 0, location_from: '', location_to: '' }])
  const [products, setProducts] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then(r=>r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => { console.error('Failed to fetch products:', err); setProducts([]) })
    
    fetch('/api/locations')
      .then(r=>r.json())
      .then(data => setLocations(Array.isArray(data) ? data : []))
      .catch(err => { console.error('Failed to fetch locations:', err); setLocations([]) })
  }, [])

  function addLine(){
    setLines([...lines, { product_id: '', qty_expected: 0, qty_done: 0, location_from: '', location_to: '' }])
  }

  function updateLine(index: number, field: string, value: any){
    const updated = [...lines]
    updated[index][field] = value
    setLines(updated)
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        doc_type: docType,
        status: 'DRAFT',
        reference_no: referenceNo,
        supplier: supplier || null,
        customer: customer || null,
        notes: notes || null
      }
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to create document')
      const doc = await res.json()
      
      // Insert lines
      for (const line of lines){
        await fetch('/api/document-lines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...line, document_id: doc.id })
        })
      }

      router.push(`/documents/${docType.toLowerCase()}s`)
    } catch (err) {
      alert('Error creating document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Reference No</label>
          <input className="border rounded px-3 py-2 w-full" value={referenceNo} onChange={e=>setReferenceNo(e.target.value)} />
        </div>
        {docType === 'RECEIPT' && (
          <div>
            <label className="block text-sm font-medium mb-1">Supplier</label>
            <input className="border rounded px-3 py-2 w-full" value={supplier} onChange={e=>setSupplier(e.target.value)} />
          </div>
        )}
        {docType === 'DELIVERY' && (
          <div>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <input className="border rounded px-3 py-2 w-full" value={customer} onChange={e=>setCustomer(e.target.value)} />
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea className="border rounded px-3 py-2 w-full" value={notes} onChange={e=>setNotes(e.target.value)} rows={3} />
      </div>

      <div>
        <h3 className="font-semibold mb-2">Lines</h3>
        {Array.isArray(lines) && lines.map((line, idx) => (
          <div key={idx} className="border p-3 mb-2 rounded grid grid-cols-5 gap-2">
            <div>
              <label className="text-xs">Product</label>
              <select className="border rounded px-2 py-1 w-full text-sm" value={line.product_id} onChange={e=>updateLine(idx, 'product_id', e.target.value)}>
                <option value="">Select</option>
                {Array.isArray(products) && products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs">Qty Expected</label>
              <input type="number" className="border rounded px-2 py-1 w-full text-sm" value={line.qty_expected} onChange={e=>updateLine(idx, 'qty_expected', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="text-xs">Qty Done</label>
              <input type="number" className="border rounded px-2 py-1 w-full text-sm" value={line.qty_done} onChange={e=>updateLine(idx, 'qty_done', parseFloat(e.target.value))} />
            </div>
            {(docType === 'DELIVERY' || docType === 'TRANSFER') && (
              <div>
                <label className="text-xs">From Location</label>
                <select className="border rounded px-2 py-1 w-full text-sm" value={line.location_from} onChange={e=>updateLine(idx, 'location_from', e.target.value)}>
                  <option value="">Select</option>
                  {Array.isArray(locations) && locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            )}
            {(docType === 'RECEIPT' || docType === 'TRANSFER' || docType === 'ADJUSTMENT') && (
              <div>
                <label className="text-xs">To Location</label>
                <select className="border rounded px-2 py-1 w-full text-sm" value={line.location_to} onChange={e=>updateLine(idx, 'location_to', e.target.value)}>
                  <option value="">Select</option>
                  {Array.isArray(locations) && locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            )}
          </div>
        ))}
        <button type="button" onClick={addLine} className="text-sm text-blue-600">+ Add Line</button>
      </div>

      <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading}>
        {loading ? 'Creating...' : 'Create Draft'}
      </button>
    </form>
  )
}
