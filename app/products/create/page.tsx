'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import ProductForm from '../../../components/ProductForm'

export default function CreateProductPage(){
  const router = useRouter()

  function handleSuccess(){
    router.push('/products')
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Create Product</h1>
      <ProductForm onSuccess={handleSuccess} />
    </div>
  )
}
