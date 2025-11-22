import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const sb = createClient(supabaseUrl, serviceRole)

export async function GET(req: Request, { params }: any){
  try{
    const { data, error } = await sb.from('documents').select('*').eq('id', params.id).single()
    if (error) throw error
    return NextResponse.json(data)
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 404 })
  }
}

export async function PATCH(req: Request, { params }: any){
  try{
    const body = await req.json()
    const { data, error } = await sb.from('documents').update(body).eq('id', params.id).select().single()
    if (error) throw error
    return NextResponse.json(data)
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: any){
  try{
    const { error } = await sb.from('documents').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
