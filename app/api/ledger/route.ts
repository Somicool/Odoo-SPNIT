import { NextResponse } from 'next/server'
import * as stock from '../../../server/stockActions'

export async function GET(req: Request){
  try{
    const url = new URL(req.url)
    const product_id = url.searchParams.get('product_id')
    const location_id = url.searchParams.get('location_id')
    const data = await stock.listLedger({ product_id, location_id })
    return NextResponse.json(data)
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
