import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const sb = createClient(supabaseUrl, serviceRole)

export async function GET(){
  try{
    // Fetch KPIs: total products, low stock, pending docs
    const { data: products } = await sb.from('products').select('*')
    const { data: lowStock } = await sb.from('stock_balances').select('*, products!inner(reorder_level)').lt('quantity', 'products.reorder_level')
    const { data: pendingReceipts } = await sb.from('documents').select('*').eq('doc_type', 'RECEIPT').eq('status', 'DRAFT')
    const { data: pendingDeliveries } = await sb.from('documents').select('*').eq('doc_type', 'DELIVERY').eq('status', 'DRAFT')
    const { data: pendingTransfers } = await sb.from('documents').select('*').eq('doc_type', 'TRANSFER').eq('status', 'DRAFT')

    return NextResponse.json({
      totalProducts: products?.length ?? 0,
      lowStockItems: lowStock?.length ?? 0,
      pendingReceipts: pendingReceipts?.length ?? 0,
      pendingDeliveries: pendingDeliveries?.length ?? 0,
      pendingTransfers: pendingTransfers?.length ?? 0
    })
  }catch(err:any){
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
