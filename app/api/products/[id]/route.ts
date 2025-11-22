import { NextResponse } from 'next/server'
import * as actions from '../../../../server/productActions'

export async function PUT(req: Request, { params }: any){
  try{
    const body = await req.json()
    const updated = await actions.updateProduct(params.id, body)
    return NextResponse.json(updated)
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: any){
  try{
    await actions.deleteProduct(params.id)
    return NextResponse.json({ success: true })
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
