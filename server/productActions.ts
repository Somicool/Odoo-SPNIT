import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const sb = createClient(supabaseUrl, serviceRole)

export async function listProducts(){
  const { data, error } = await sb.from('products').select('*')
  if (error) throw error
  return data
}

export async function createProduct(payload: any){
  const { data, error } = await sb.from('products').insert([payload]).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(id: string, payload: any){
  const { data, error } = await sb.from('products').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteProduct(id: string){
  const { error } = await sb.from('products').delete().eq('id', id)
  if (error) throw error
  return { success: true }
}
