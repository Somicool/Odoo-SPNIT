import { NextResponse } from 'next/server'
import * as actions from '../../../server/productActions'

export async function GET(){
  try{
    const data = await actions.listProducts()
    return NextResponse.json(data)
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request){
  try{
    const body = await req.json()
    const created = await actions.createProduct(body)
    return NextResponse.json(created, { status: 201 })
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
