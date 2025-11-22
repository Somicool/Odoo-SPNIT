'use client'
import React from 'react'
import { useParams } from 'next/navigation'

export default function ProductDetailPage(){
  const params = useParams()
  const id = params.id

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Product Details</h1>
      <p className="text-sm text-slate-600">Product ID: {id}</p>
      <p className="text-sm mt-2">Extend this page to show product details, stock by location, and edit form.</p>
    </div>
  )
}
