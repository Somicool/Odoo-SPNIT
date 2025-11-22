'use client'
import React from 'react'
import DocumentForm from '../../../../components/DocumentForm'

export default function CreateAdjustmentPage(){
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Create Adjustment</h1>
      <DocumentForm docType="ADJUSTMENT" />
    </div>
  )
}
