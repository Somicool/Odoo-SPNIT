import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const sb = createClient(supabaseUrl, serviceRole)

export async function GET(req: Request){
  try{
    const url = new URL(req.url)
    const document_id = url.searchParams.get('document_id')
    let q = sb.from('document_lines').select('*')
    if (document_id) q = q.eq('document_id', document_id)
    const { data, error } = await q
    if (error) throw error
    return NextResponse.json(data)
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
