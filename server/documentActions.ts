import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const sb = createClient(supabaseUrl, serviceRole)

export async function createDocument(payload: any){
  // Auto-generate reference if not provided
  if (!payload.reference_no) {
    const warehouseCode = 'WH'; // Default warehouse code
    const operationMap: any = {
      'RECEIPT': 'IN',
      'DELIVERY': 'OUT',
      'TRANSFER': 'INT',
      'ADJUSTMENT': 'ADJ'
    };
    const operation = operationMap[payload.doc_type] || 'DOC';
    
    const { data: refData } = await sb.rpc('generate_reference_no', {
      p_warehouse_code: warehouseCode,
      p_operation: operation
    });
    
    payload.reference_no = refData || `${warehouseCode}/${operation}/001`;
  }
  
  const { data, error } = await sb.from('documents').insert([payload]).select().single()
  if (error) throw error
  return data
}

export async function getDocument(id: string){
  const { data, error } = await sb.from('documents').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function updateDocument(id: string, payload: any){
  const { data, error } = await sb.from('documents').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function listDocuments(type?: string){
  let q = sb.from('documents').select('*').order('created_at', { ascending: false })
  if (type) q = q.eq('doc_type', type)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function validateDocument(id: string, docType: string){
  // choose RPC function based on docType
  const rpcName = docType === 'RECEIPT' ? 'validate_receipt' : docType === 'DELIVERY' ? 'validate_delivery' : docType === 'TRANSFER' ? 'validate_transfer' : 'validate_adjustment'
  const { error } = await sb.rpc(rpcName, { doc: id })
  if (error) throw error
  return { success: true }
}
