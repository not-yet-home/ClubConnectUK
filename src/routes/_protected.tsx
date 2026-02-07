import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/common/protected-layout'
import { authStore } from '@/features/auth/store'

export const Route = createFileRoute('/_protected')({
  beforeLoad: () => {
    const { isAuthenticated, isLoading } = authStore.state

    if (!isLoading && !isAuthenticated) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: ProtectedRoute,
})

function ProtectedRoute() {
  return (
    <ProtectedLayout>
      <Outlet />
    </ProtectedLayout>
  )
}
