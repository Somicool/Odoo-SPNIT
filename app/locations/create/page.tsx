'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateLocationPage(){
  const router = useRouter()
  const [name, setName] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/warehouses')
      .then(r=>r.json())
      .then(data => setWarehouses(Array.isArray(data) ? data : []))
      .catch(err => { console.error('Failed to fetch warehouses:', err); setWarehouses([]) })
  }, [])

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, warehouse_id: warehouseId })
      })
      if (!res.ok) throw new Error('Failed to create')
      router.push('/warehouses')
    } catch (err) {
      alert('Error creating location')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Create Location</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">Warehouse</label>
          <select className="border rounded px-3 py-2 w-full" value={warehouseId} onChange={e=>setWarehouseId(e.target.value)} required>
            <option value="">Select Warehouse</option>
            {Array.isArray(warehouses) && warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input className="border rounded px-3 py-2 w-full" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading}>
          {loading ? 'Creating...' : 'Create Location'}
        </button>
      </form>
    </div>
  )
}
