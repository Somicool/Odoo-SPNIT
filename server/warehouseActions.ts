import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const sb = createClient(supabaseUrl, serviceRole)

export async function createWarehouse(payload: any){
  const { data, error } = await sb.from('warehouses').insert([payload]).select().single()
  if (error) throw error
  return data
}

export async function getWarehouse(id: string){
  const { data, error } = await sb.from('warehouses').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function updateWarehouse(id: string, payload: any){
  const { data, error } = await sb.from('warehouses').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteWarehouse(id: string){
  const { error } = await sb.from('warehouses').delete().eq('id', id)
  if (error) throw error
  return { success: true }
}

export async function listWarehouses(){
  const { data, error } = await sb.from('warehouses').select('*').order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function createLocation(payload: any){
  const { data, error } = await sb.from('locations').insert([payload]).select().single()
  if (error) throw error
  return data
}

export async function getLocation(id: string){
  const { data, error } = await sb.from('locations').select(`
    *,
    warehouse:warehouses(id, name, code)
  `).eq('id', id).single()
  if (error) throw error
  return data
}

export async function updateLocation(id: string, payload: any){
  const { data, error } = await sb.from('locations').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteLocation(id: string){
  const { error } = await sb.from('locations').delete().eq('id', id)
  if (error) throw error
  return { success: true }
}

export async function listLocations(warehouseId?: string){
  let q = sb.from('locations').select(`
    *,
    warehouse:warehouses(id, name, code)
  `).order('name', { ascending: true })
  
  if (warehouseId) {
    q = q.eq('warehouse_id', warehouseId)
  }
  
  const { data, error } = await q
  if (error) throw error
  return data
}
