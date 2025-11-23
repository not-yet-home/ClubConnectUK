import { useStore } from '@tanstack/react-store'
import { authStore, login, logout } from '@/lib/auth.store'
import type { LoginCredentials } from '@/lib/auth.types'

export function useAuth() {
    const authState = useStore(authStore)

    return {
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        login: (credentials: LoginCredentials) => login(credentials),
        logout: () => logout(),
    }
}
