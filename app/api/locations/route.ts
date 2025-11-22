import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const sb = createClient(supabaseUrl, serviceRole)

export async function GET(){
  try{
    const { data, error } = await sb.from('locations').select(`
      *,
      warehouse:warehouses(id, name, code)
    `)
    if (error) throw error
    return NextResponse.json(data)
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request){
  try{
    const body = await req.json()
    const { data, error } = await sb.from('locations').insert([body]).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
