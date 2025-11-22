import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabaseClient'
import type { ProductInput } from '../utils/validations'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*')
      if (error) throw error
      return data
    }
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ProductInput) => {
      const { data, error } = await supabase.from('products').insert([payload]).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] })
  })
}
