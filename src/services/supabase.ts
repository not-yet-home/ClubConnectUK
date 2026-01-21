// Supabase client - gracefully handles missing credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasValidCredentials =
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key-here'

// Mock Supabase client for when credentials are missing or package not installed
const createMockClient = (reason: string) => {
    console.warn(`⚠️ ${reason}`)
    return {
        auth: {
            getSession: () => ({ data: { session: null }, error: null }),
            signInWithPassword: () => ({
                data: { user: null, session: null },
                error: { message: reason, code: 'not_configured' }
            }),
            signOut: () => ({ error: null }),
            onAuthStateChange: () => {
                return {
                    data: { subscription: { unsubscribe: () => { } } }
                }
            },
        },
    }
}

let supabase: any

try {
    if (!hasValidCredentials) {
        supabase = createMockClient('Supabase credentials not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local')
    } else {
        // Try to import Supabase - will fail if package not installed
        const { createClient } = await import('@supabase/supabase-js')
        supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
            },
        })
    }
} catch (error) {
    supabase = createMockClient('Supabase package not installed. Run: pnpm add @supabase/supabase-js')
}

export { supabase }
