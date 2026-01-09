import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center space-y-4">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-xl text-muted-foreground">Page Not Found</p>
            <p className="max-w-md text-muted-foreground">
                Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
            </p>
            <Button asChild>
                <Link to="/">Go Home</Link>
            </Button>
        </div>
    )
}
