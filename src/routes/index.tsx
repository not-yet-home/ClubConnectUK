import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Lock, Mail } from 'lucide-react'
import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/')({
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login({ email, password })

      if (result.error) {
        setError(result.error.message)
      } else {
        router.navigate({ to: '/dashboard' })
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden relative bg-white text-neutral-400 antialiased">
      {/* Left Side: Visual / Brand Atmosphere */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-neutral-900 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/login_image.png" alt="Dancer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-primary tracking-tighter font-medium text-lg uppercase">
              Dance & Arts System
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-md animate-slide-up">
          <blockquote className="text-xl font-medium text-primary tracking-tight leading-relaxed mb-6 italic">
            "Dance is the hidden language of the soul. We nurture talent and
            build confidence through movement."
          </blockquote>
          <div className="flex items-center gap-3">
            {/* <div className="flex -space-x-3">
                            <img className="w-8 h-8 rounded-full border border-black" src="https://i.pravatar.cc/100?img=5" alt="Student" />
                            <img className="w-8 h-8 rounded-full border border-black" src="https://i.pravatar.cc/100?img=9" alt="Student" />
                            <img className="w-8 h-8 rounded-full border border-black" src="https://i.pravatar.cc/100?img=12" alt="Student" />
                        </div> */}
            {/* <span className="text-xs text-neutral-400">Joined by 500+ dancers</span> */}
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 relative z-20 bg-white">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-6 lg:hidden flex items-center gap-2">
          <span className="text-primary tracking-tighter font-medium text-sm uppercase">
            Dance & Arts System{' '}
          </span>
        </div>

        <div
          className="w-full max-w-sm mx-auto space-y-8 animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-2xl font-medium text-primary tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-neutral-500">
              Enter your credentials to access the portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5 group">
              <Label
                htmlFor="email"
                className="text-neutral-600 transition-colors"
              >
                Email Address
              </Label>
              <div className="relative">
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="name@dancearts-uk.com"
                  required
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 peer-focus:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 group">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-neutral-600 transition-colors"
                >
                  Password
                </Label>
                <a
                  href="#"
                  className="text-xs text-neutral-500 hover:text-primary transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 text-xs"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 peer-focus:text-primary transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  id="remember"
                  className="border-neutral-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm text-neutral-500 group-hover:text-neutral-800 transition-colors">
                  Keep me signed in
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--primary-light)] hover:bg-[var(--primary)] text-black font-medium py-6 rounded-md transition-all shadow-[0_0_15px_-3px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_-3px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <HugeiconsIcon
                    size={32}
                    className="group-hover:translate-x-0.5 transition-transform"
                    icon={ArrowRight02Icon}
                  />
                </>
              )}
            </Button>
          </form>

          {/* <p className="text-center text-sm text-neutral-500">
                        Not a member yet?{' '}
                        <a href="#" className="text-primary hover:text-primary-light font-medium transition-colors">
                            Apply for enrollment
                        </a>
                    </p> */}
        </div>

        {/* Footer Links */}
        {/* <div className="absolute bottom-6 w-full text-center lg:text-left lg:px-12">
                    <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-neutral-600">
                        <a href="#" className="hover:text-neutral-400 transition-colors">
                            Privacy
                        </a>
                        <a href="#" className="hover:text-neutral-400 transition-colors">
                            Terms
                        </a>
                        <a href="#" className="hover:text-neutral-400 transition-colors">
                            Contact
                        </a>
                    </div>
                </div>*/}
      </div>
    </div>
  )
}
