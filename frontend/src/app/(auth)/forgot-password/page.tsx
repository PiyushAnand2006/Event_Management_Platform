'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    // Simulated password reset - in production, this would send an email
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setIsSubmitted(true)
    toast.success('Password reset link sent to your email!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <Card className="border-border/50 shadow-xl shadow-primary/5">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isSubmitted ? 'Check your email' : 'Forgot password?'}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1.5">
              {isSubmitted
                ? `We've sent a password reset link to ${email}`
                : "No worries, we'll send you a reset link"
              }
            </CardDescription>
          </div>
        </CardHeader>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  className="h-11"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                className="w-full h-11 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </CardFooter>
          </form>
        ) : (
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-semibold"
              onClick={() => { setIsSubmitted(false); setEmail('') }}
            >
              Try a different email
            </Button>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  )
}