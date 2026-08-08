import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  // These are inlined at build time, so a missing value fails the same way in
  // every environment. Say so plainly instead of throwing "supabaseUrl is required".
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env.local and ' +
      'set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase ' +
      'dashboard → Project Settings → API), then restart the dev server.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
