import { NextResponse } from 'next/server'
import * as docActions from '../../../server/documentActions'

export async function GET(req: Request){
  try{
    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    const data = await docActions.listDocuments(type || undefined)
    return NextResponse.json(data)
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request){
  try{
    const body = await req.json()
    const created = await docActions.createDocument(body)
    return NextResponse.json(created, { status: 201 })
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
