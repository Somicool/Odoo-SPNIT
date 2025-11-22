'use client'
import React from 'react'
import DocumentForm from '../../../../components/DocumentForm'

export default function CreateDeliveryPage(){
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Create Delivery</h1>
      <DocumentForm docType="DELIVERY" />
    </div>
  )
}
