'use client'
import React, { useState } from 'react'
import { productSchema, type ProductInput } from '../utils/validations'
import { useCreateProduct } from '../lib/queries'

interface ProductFormProps {
  onSuccess?: () => void
  initialData?: ProductInput & { id?: string }
}

export default function ProductForm({ onSuccess, initialData }: ProductFormProps){
  const [name, setName] = useState(initialData?.name || '')
  const [sku, setSku] = useState(initialData?.sku || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [uom, setUom] = useState(initialData?.uom || '')
  const [reorderLevel, setReorderLevel] = useState(initialData?.reorder_level?.toString() || '0')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateProduct()

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    const parsed = productSchema.safeParse({
      name,
      sku,
      category: category || undefined,
      uom: uom || undefined,
      reorder_level: parseInt(reorderLevel) || 0
    })
    if (!parsed.success){
      setError(parsed.error.errors.map((x: any) => x.message).join(', '))
      return
    }
    try {
      await createMutation.mutateAsync(parsed.data)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input 
          className="border rounded px-3 py-2 w-full" 
          value={name} 
          onChange={e=>setName(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">SKU</label>
        <input 
          className="border rounded px-3 py-2 w-full" 
          value={sku} 
          onChange={e=>setSku(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <input 
          className="border rounded px-3 py-2 w-full" 
          value={category} 
          onChange={e=>setCategory(e.target.value)} 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Unit of Measure</label>
        <input 
          className="border rounded px-3 py-2 w-full" 
          value={uom} 
          onChange={e=>setUom(e.target.value)} 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Reorder Level</label>
        <input 
          type="number"
          className="border rounded px-3 py-2 w-full" 
          value={reorderLevel} 
          onChange={e=>setReorderLevel(e.target.value)} 
        />
      </div>
      <button 
        type="submit" 
        className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Saving...' : 'Save Product'}
      </button>
    </form>
  )
}
