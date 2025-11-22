'use client'
import React from 'react'
import DocumentForm from '../../../../components/DocumentForm'

export default function CreateTransferPage(){
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Create Transfer</h1>
      <DocumentForm docType="TRANSFER" />
    </div>
  )
}
