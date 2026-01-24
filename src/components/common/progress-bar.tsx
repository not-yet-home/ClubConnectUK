import { useRouterState } from '@tanstack/react-router'
import NProgress from 'nprogress'
import { useEffect } from 'react'

export function ProgressBar() {
    const isLoading = useRouterState({
        select: (s) => s.status === 'pending',
    })

    useEffect(() => {
        if (isLoading) {
            NProgress.start()
        } else {
            NProgress.done()
        }
    }, [isLoading])

    return null
}
