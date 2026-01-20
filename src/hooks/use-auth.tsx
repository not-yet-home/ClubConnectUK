import { useStore } from '@tanstack/react-store'
import type { LoginCredentials } from '@/features/auth/types'
import { authStore, login, logout } from '@/features/auth/store'

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
