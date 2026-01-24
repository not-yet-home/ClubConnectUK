import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasValidCredentials =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'

// Mock Supabase client for when credentials are missing
const createMockClient = (reason: string) => {
  console.warn(`⚠️ ${reason}`)
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: reason, code: 'not_configured' },
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => {
        return {
          data: { subscription: { unsubscribe: () => {} } },
        }
      },
    },
  }
}

let supabase: any

if (!hasValidCredentials) {
  supabase = createMockClient(
    'Supabase credentials not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env',
  )
} else {
  try {
    console.log('📡 Initializing Supabase client with URL:', supabaseUrl)
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error)
    supabase = createMockClient('Supabase client creation failed.')
  }
}

export { supabase }
