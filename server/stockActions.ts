import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const sb = createClient(supabaseUrl, serviceRole)

export async function listLedger(filters: any = {}){
  let q = sb.from('stock_ledger').select('*')
  if (filters.product_id) q = q.eq('product_id', filters.product_id)
  if (filters.location_id) q = q.eq('location_id', filters.location_id)
  if (filters.doc_id) q = q.eq('doc_id', filters.doc_id)
  const { data, error } = await q.order('created_at', { ascending: false })
  if (error) throw error
  return data
}
