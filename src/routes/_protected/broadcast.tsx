import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/broadcast')({
  component: BroadcastLayout,
})

function BroadcastLayout() {
  return <Outlet />
}
