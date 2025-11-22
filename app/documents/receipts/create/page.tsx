'use client'
import React from 'react'
import DocumentForm from '../../../../components/DocumentForm'

export default function CreateReceiptPage(){
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Create Receipt</h1>
      <DocumentForm docType="RECEIPT" />
    </div>
  )
}
