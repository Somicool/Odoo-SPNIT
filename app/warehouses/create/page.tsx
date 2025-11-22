'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateWarehousePage(){
  const router = useRouter()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    // Call API to create warehouse
    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address })
      })
      if (!res.ok) throw new Error('Failed to create')
      router.push('/warehouses')
    } catch (err) {
      alert('Error creating warehouse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Create Warehouse</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input className="border rounded px-3 py-2 w-full" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input className="border rounded px-3 py-2 w-full" value={address} onChange={e=>setAddress(e.target.value)} />
        </div>
        <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading}>
          {loading ? 'Creating...' : 'Create Warehouse'}
        </button>
      </form>
    </div>
  )
}
