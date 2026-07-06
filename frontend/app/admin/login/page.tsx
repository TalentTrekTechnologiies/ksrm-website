"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  BarChart3,
  Clock,
  Loader2,
} from "lucide-react"
import { login } from "@/lib/auth-api"
import { setToken, setStoredAdmin } from "@/lib/auth"
import { ApiError } from "@/lib/api-client"

const FEATURES = [
  {
    icon: Shield,
    title: "Secure Access",
    description: "Role based secure access for administrators",
  },
  {
    icon: BarChart3,
    title: "Manage Efficiently",
    description: "Manage content, users and operations seamlessly",
  },
  {
    icon: Clock,
    title: "Real-time Insights",
    description: "Get real-time updates and analytics at a glance",
  },
]

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const { accessToken, admin } = await login(email, password)
      setToken(accessToken, rememberMe)
      setStoredAdmin(admin, rememberMe)
      router.push("/admin/dashboard")
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not reach the server. Please try again.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Real KSRM campus entrance photo as the full-screen background */}
      <Image
        src="/Filtered/campus entrance.jpeg"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(30,58,138,0.45) 45%, rgba(15,23,42,0.75) 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md rounded-2xl border border-white/40 bg-white/85 p-8 shadow-2xl backdrop-blur-xl md:p-10"
        >
          {/* Branding */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 h-16 w-16 overflow-hidden rounded-full bg-admin-sidebar shadow-md">
              <Image
                src="/logo.png"
                alt="KSRM College of Engineering"
                width={64}
                height={64}
                className="mix-blend-screen"
              />
            </div>
            <p
              style={{ fontFamily: "var(--font-admin-heading)" }}
              className="text-lg font-bold leading-tight text-admin-primary"
            >
              KSRM COLLEGE OF ENGINEERING
            </p>
            <p className="mt-1.5 text-[11px] font-semibold tracking-[0.2em] text-admin-gold">
              &mdash; ADMINISTRATOR PORTAL &mdash;
            </p>
          </div>

          <div className="mt-7">
            <h1 className="text-2xl font-bold text-neutral-900">Welcome Back!</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Sign in to continue to KSRM CMS
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-neutral-200 bg-white/70 py-2.5 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-neutral-200 bg-white/70 py-2.5 pl-10 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-neutral-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-admin-primary focus:ring-admin-primary/30"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() =>
                  setError(
                    "Password reset isn't available yet - please contact your system administrator.",
                  )
                }
                className="font-medium text-admin-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-admin-primary py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-admin-primary-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-400">or continue with</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <p className="text-center text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} KSRM College of Engineering. All rights reserved.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3 text-white">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-white/70">{description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  )
}
