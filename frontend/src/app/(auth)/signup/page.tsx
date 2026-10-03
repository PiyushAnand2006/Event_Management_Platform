'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, CalendarDays, UserPlus, FileText, ShieldCheck, Cookie, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { LegalModal } from '@/components/common/legal-modal'
import { toast } from 'sonner'
import Link from 'next/link'

const TERMS_CONTENT = (
  <>
    <h3 className="text-foreground font-semibold mb-3">Terms of Service</h3>
    <p className="mb-3">Last updated: August 2025</p>
    <p className="mb-3">
      Welcome to Occasio. By accessing or using our platform, you agree to be bound by these Terms of Service.
      Please read them carefully before using our services.
    </p>
    <h4 className="text-foreground font-medium mb-2">1. Account Registration</h4>
    <p className="mb-3">
      To use certain features of Occasio, you must create an account. You are responsible for maintaining
      the confidentiality of your account credentials and for all activities that occur under your account.
    </p>
    <h4 className="text-foreground font-medium mb-2">2. Event Creation</h4>
    <p className="mb-3">
      Organizers are responsible for the accuracy of event information. Occasio reserves the right to
      remove events that violate our community guidelines.
    </p>
    <h4 className="text-foreground font-medium mb-2">3. User Conduct</h4>
    <p className="mb-3">
      Users must not engage in harassment, spam, or any activity that disrupts the platform experience
      for others.
    </p>
    <h4 className="text-foreground font-medium mb-2">4. Limitation of Liability</h4>
    <p>
      Occasio is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
      damages arising from the use of our platform.
    </p>
  </>
)

const PRIVACY_CONTENT = (
  <>
    <h3 className="text-foreground font-semibold mb-3">Privacy Policy</h3>
    <p className="mb-3">Last updated: August 2025</p>
    <p className="mb-3">
      At Occasio, we take your privacy seriously. This policy describes how we collect, use, and protect
      your personal information.
    </p>
    <h4 className="text-foreground font-medium mb-2">1. Information We Collect</h4>
    <p className="mb-3">
      We collect information you provide directly, such as your name, email address, and profile details.
      We also collect usage data automatically through cookies and similar technologies.
    </p>
    <h4 className="text-foreground font-medium mb-2">2. How We Use Your Information</h4>
    <p className="mb-3">
      We use your information to provide and improve our services, communicate with you about events,
      and ensure platform security.
    </p>
    <h4 className="text-foreground font-medium mb-2">3. Data Sharing</h4>
    <p className="mb-3">
      We do not sell your personal information. We may share data with event organizers (as needed for
      event participation) and with service providers who assist in operating our platform.
    </p>
    <h4 className="text-foreground font-medium mb-2">4. Your Rights</h4>
    <p>
      You may access, update, or delete your personal information at any time through your account settings
      or by contacting our support team.
    </p>
  </>
)

const COOKIES_CONTENT = (
  <>
    <h3 className="text-foreground font-semibold mb-3">Cookie Policy</h3>
    <p className="mb-3">Last updated: August 2025</p>
    <p className="mb-3">
      This Cookie Policy explains how Occasio uses cookies and similar tracking technologies when you
      visit our platform.
    </p>
    <h4 className="text-foreground font-medium mb-2">1. What Are Cookies?</h4>
    <p className="mb-3">
      Cookies are small text files stored on your device that help us improve your browsing experience
      and understand how our platform is used.
    </p>
    <h4 className="text-foreground font-medium mb-2">2. Types of Cookies We Use</h4>
    <ul className="list-disc pl-5 mb-3 space-y-1">
      <li><strong>Essential cookies:</strong> Required for the platform to function properly (authentication, security).</li>
      <li><strong>Analytics cookies:</strong> Help us understand how users interact with our platform.</li>
      <li><strong>Preference cookies:</strong> Remember your settings and preferences.</li>
    </ul>
    <h4 className="text-foreground font-medium mb-2">3. Managing Cookies</h4>
    <p>
      You can manage your cookie preferences through your browser settings. Note that disabling certain
      cookies may affect the functionality of our platform.
    </p>
  </>
)

// Client-side validation copy for the signup form
const LENGTH_MESSAGE = 'Password must be at least 8 characters'
const COMPLEXITY_MESSAGE = 'Must include uppercase, lowercase, and number'
const MISMATCH_MESSAGE = 'Passwords do not match'
const MATCH_MESSAGE = 'Passwords must match'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Legal modals
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [cookiesOpen, setCookiesOpen] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'name':
        if (value && value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters'
        } else {
          delete newErrors.name
        }
        break
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email'
        } else {
          delete newErrors.email
        }
        break
      case 'password':
        if (value && value.length < 8) {
          newErrors.password = LENGTH_MESSAGE
        } else if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = COMPLEXITY_MESSAGE
        } else {
          delete newErrors.password
        }
        // Revalidate confirm password
        if (confirmPassword && confirmPassword !== value) {
          newErrors.confirmPassword = MISMATCH_MESSAGE
        } else if (confirmPassword) {
          delete newErrors.confirmPassword
        }
        break
      case 'confirmPassword':
        if (value && value !== password) {
          newErrors.confirmPassword = MISMATCH_MESSAGE
        } else {
          delete newErrors.confirmPassword
        }
        break
    }

    setErrors(newErrors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Full validation
    const validationErrors: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2) validationErrors.name = 'Name is required (min 2 chars)'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) validationErrors.email = 'Valid email is required'
    if (!password || password.length < 8) validationErrors.password = LENGTH_MESSAGE
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) validationErrors.password = COMPLEXITY_MESSAGE
    if (!confirmPassword || confirmPassword !== password) validationErrors.confirmPassword = MATCH_MESSAGE
    if (!role) validationErrors.role = 'Please select a role'
    if (!agreedToTerms) validationErrors.terms = 'You must agree to the terms'

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error('Please fix the errors in the form')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Signup failed')
        return
      }

      toast.success('Account created successfully!')

      // Auto sign in
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      if (result?.ok) {
        switch (role) {
          case 'organizer':
            router.push('/dashboard')
            break
          default:
            router.push('/')
        }
      } else {
        router.push('/login')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1.5">
              Join Occasio to discover and manage events
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => { setName(e.target.value); validateField('name', e.target.value) }}
                disabled={isLoading}
                autoComplete="name"
                className="h-11"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); validateField('email', e.target.value) }}
                disabled={isLoading}
                autoComplete="email"
                className="h-11"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>I want to</Label>
              <Select value={role} onValueChange={(val) => { setRole(val); setErrors(prev => { const n = { ...prev }; delete n.role; return n }) }} disabled={isLoading}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Attend events
                    </span>
                  </SelectItem>
                  <SelectItem value="organizer">
                    <span className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Organize events
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); validateField('password', e.target.value) }}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); validateField('confirmPassword', e.target.value) }}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => {
                    setAgreedToTerms(checked === true)
                    if (checked) {
                      setErrors(prev => { const n = { ...prev }; delete n.terms; return n })
                    }
                  }}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-snug cursor-pointer">
                  I agree to the following
                </Label>
              </div>
              <div className="grid gap-1.5 pl-6">
                {[
                  { icon: FileText, label: 'Terms of Service', open: () => setTermsOpen(true) },
                  { icon: ShieldCheck, label: 'Privacy Policy', open: () => setPrivacyOpen(true) },
                  { icon: Cookie, label: 'Cookie Policy', open: () => setCookiesOpen(true) },
                ].map(({ icon: Icon, label, open }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={open}
                    disabled={isLoading}
                    className="group flex w-full items-center gap-2.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-medium text-foreground/90 group-hover:text-primary transition-colors">
                      {label}
                    </span>
                    <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
              {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}
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
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Legal Modals */}
      <LegalModal open={termsOpen} onOpenChange={setTermsOpen} title="Terms of Service">
        {TERMS_CONTENT}
      </LegalModal>
      <LegalModal open={privacyOpen} onOpenChange={setPrivacyOpen} title="Privacy Policy">
        {PRIVACY_CONTENT}
      </LegalModal>
      <LegalModal open={cookiesOpen} onOpenChange={setCookiesOpen} title="Cookie Policy">
        {COOKIES_CONTENT}
      </LegalModal>
    </motion.div>
  )
}