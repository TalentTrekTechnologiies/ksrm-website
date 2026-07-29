"use client"

import { useEffect, useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
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
  X,
  LogIn,
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
  const [panelOpen, setPanelOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPanelOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

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
      {/* Real K.S.R.M. campus entrance photo as the full-screen background - unchanged */}
      <Image
        src="/Filtered/campus entrance.jpeg"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <motion.div
        className="absolute inset-0"
        animate={{
          background: panelOpen
            ? "linear-gradient(180deg, rgba(15,23,42,0.72) 0%, rgba(30,58,138,0.6) 45%, rgba(15,23,42,0.85) 100%)"
            : "linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(30,58,138,0.4) 45%, rgba(15,23,42,0.7) 100%)",
        }}
        transition={{ duration: 0.35 }}
      />

      {/* Clicking the empty backdrop (not the panel itself) closes the panel,
          same as the Escape key handler above and the explicit close button. */}
      <div
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10"
        onClick={(e) => {
          if (panelOpen && e.target === e.currentTarget) setPanelOpen(false)
        }}
      >
        <AnimatePresence mode="wait">
          {!panelOpen ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex cursor-pointer flex-col items-center gap-8 text-center"
              onClick={() => setPanelOpen(true)}
            >
              <div className="flex flex-col items-center">
                <div className="mb-4 h-20 w-20 overflow-hidden rounded-full bg-admin-sidebar shadow-lg">
                  <Image
                    src="/logo.png"
                    alt="K.S.R.M. College of Engineering"
                    width={80}
                    height={80}
                    className="mix-blend-screen"
                  />
                </div>
                <p
                  style={{ fontFamily: "var(--font-admin-heading)" }}
                  className="text-2xl font-bold text-white drop-shadow-md"
                >
                  K.S.R.M. COLLEGE OF ENGINEERING
                </p>
                <p className="mt-2 text-xs font-semibold tracking-[0.25em] text-admin-gold">
                  &mdash; ADMINISTRATOR PORTAL &mdash;
                </p>
              </div>

              <motion.button
                type="button"
                aria-label="Click to login"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ["0 0 0 0 rgba(212,175,55,0.4)", "0 0 0 14px rgba(212,175,55,0)"] }}
                transition={{ boxShadow: { duration: 1.8, repeat: Infinity, ease: "easeOut" } }}
                className="flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-admin-primary shadow-xl backdrop-blur-sm"
              >
                <LogIn className="h-4 w-4" />
                Click to Login
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="mt-4 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3"
              >
                {FEATURES.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex items-start gap-3 text-left text-white">
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
            </motion.div>
          ) : (
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                background: "rgba(255, 255, 255, 0.85)",
              }}
              className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/40 p-8 shadow-2xl md:p-9"
            >
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                aria-label="Close login panel"
                className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Branding */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 h-14 w-14 overflow-hidden rounded-full bg-admin-sidebar shadow-md">
                  <Image
                    src="/logo.png"
                    alt="K.S.R.M. College of Engineering"
                    width={56}
                    height={56}
                    className="mix-blend-screen"
                  />
                </div>
                <p
                  style={{ fontFamily: "var(--font-admin-heading)" }}
                  className="text-base font-bold leading-tight text-admin-primary"
                >
                  K.S.R.M. COLLEGE OF ENGINEERING
                </p>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-admin-gold">
                  &mdash; ADMINISTRATOR PORTAL &mdash;
                </p>
              </div>

              <div className="mt-5">
                <h1 className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-xl font-bold text-transparent">Welcome Back!</h1>
                <p className="mt-0.5 text-sm text-neutral-500">
                  Sign in to continue to K.S.R.M. CMS
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
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

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-200" />
                <span className="text-xs text-neutral-400">or continue with</span>
                <div className="h-px flex-1 bg-neutral-200" />
              </div>

              <p className="text-center text-xs text-neutral-400">
                &copy; {new Date().getFullYear()} K.S.R.M. College of Engineering. All rights reserved.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
