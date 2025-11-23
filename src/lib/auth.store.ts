import { Store } from '@tanstack/store'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase.client'
import type { AuthState, LoginCredentials, AuthError } from './auth.types'

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
}

export const authStore = new Store<AuthState>(initialState)

// Initialize auth state from Supabase session
export async function initializeAuth() {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession()

        authStore.setState(() => ({
            user: session?.user ?? null,
            isAuthenticated: !!session?.user,
            isLoading: false,
        }))

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event: any, session: any) => {
            authStore.setState(() => ({
                user: session?.user ?? null,
                isAuthenticated: !!session?.user,
                isLoading: false,
            }))
        })
    } catch (error) {
        console.error('Failed to initialize auth:', error)
        authStore.setState(() => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        }))
    }
}

// Login function
export async function login(
    credentials: LoginCredentials
): Promise<{ error?: AuthError }> {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        })

        if (error) {
            return { error: { message: error.message, code: error.code } }
        }

        authStore.setState(() => ({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
        }))

        return {}
    } catch (error) {
        return {
            error: {
                message:
                    error instanceof Error ? error.message : 'An unknown error occurred',
            },
        }
    }
}

// Logout function
export async function logout(): Promise<{ error?: AuthError }> {
    try {
        const { error } = await supabase.auth.signOut()

        if (error) {
            return { error: { message: error.message } }
        }

        authStore.setState(() => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        }))

        return {}
    } catch (error) {
        return {
            error: {
                message:
                    error instanceof Error ? error.message : 'An unknown error occurred',
            },
        }
    }
}

// Get current user
export function getCurrentUser(): User | null {
    return authStore.state.user
}

// Check if authenticated
export function isAuthenticated(): boolean {
    return authStore.state.isAuthenticated
}
