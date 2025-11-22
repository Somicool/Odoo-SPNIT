import { NextResponse } from 'next/server'
import * as docActions from '@/server/documentActions'

export async function POST(req: Request, { params }: any){
  try{
    const body = await req.json()
    const docType = body.doc_type
    await docActions.validateDocument(params.id, docType)
    return NextResponse.json({ success: true })
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
