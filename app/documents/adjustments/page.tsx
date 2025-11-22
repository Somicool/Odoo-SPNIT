'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdjustmentsPage(){
  const [docs, setDocs] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/documents?type=ADJUSTMENT').then(r=>r.json()).then(setDocs)
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Adjustments</h1>
        <Link href="/documents/adjustments/create" className="bg-slate-900 text-white px-3 py-1 rounded">Create Adjustment</Link>
      </div>
      <div className="border rounded">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">Reference</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc: any) => (
              <tr key={doc.id} className="border-t">
                <td className="p-2">{doc.reference_no}</td>
                <td className="p-2">{doc.status}</td>
                <td className="p-2">
                  <Link href={`/documents/${doc.id}`} className="text-blue-600 text-sm">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
