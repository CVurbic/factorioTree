import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: { schema: 'factorio' },
})

export interface Blueprint {
  id: string
  name: string
  description: string | null
  author: string
  blueprint_string: string
  item_ids: string[]
  type: 'blueprint' | 'blueprint_book'
  blueprint_count: number | null
  upvotes: number
  downloads: number
  created_at: string
  source_url: string | null
  image_url: string | null
  tags: string[]
}

export interface Comment {
  id: string
  blueprint_id: string
  author: string
  body: string
  created_at: string
}
