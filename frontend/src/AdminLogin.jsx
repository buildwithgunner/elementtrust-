import { useState } from 'react'
import { getApiBaseUrl } from './lib/apiBase'

const baseURL = getApiBaseUrl()

// ─── Shared input style ───────────────────────────────────────────────────
const inputCls = (err) =>
  `w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition bg-white ${
    err
      ? 'border-red-400 focus:ring-red-300'
      : 'border-stone-300 focus:ring-[#3d4f45]/40 focus:border-[#3d4f45]'
  }`

// ─── Eye icon toggle for password ─────────────────────────────────────────
function EyeIcon({ visible }) {
  return visible ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

// ─── LOGIN FORM ────────────────────────────────────────────────────────────
function LoginForm({ onLogin, onBack }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError('')

    try {
      const res  = await fetch(`${baseURL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid email or password.')
      onLogin(data.admin, data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Email */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          Admin Email
        </label>
        <input
          required
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls(false)}
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            required
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls(false) + ' pr-11'}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600 transition"
            tabIndex={-1}
          >
            <EyeIcon visible={showPw} />
          </button>
        </div>
        {error && (
          <div className="mt-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-red-600 text-xs font-medium">{error}</p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3d4f45] hover:bg-[#303f37] text-white font-bold py-3 rounded-lg text-sm transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Authenticating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Access Dashboard
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-stone-500 hover:text-stone-700 text-sm font-medium transition text-center pt-1"
      >
        ← Back to Website
      </button>
    </form>
  )
}

// ─── SIGNUP FORM (used inside Admin Dashboard) ─────────────────────────────
function SignupForm({ token, onSuccess, onCancel }) {
  const [form, setForm]         = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [showPw, setShowPw]     = useState(false)
  const [showPw2, setShowPw2]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})
  const [globalError, setGlobalError] = useState('')
  const [success, setSuccess]   = useState('')

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    setErrors((p) => ({ ...p, [field]: '' }))
    setGlobalError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side validation
    const errs = {}
    if (!form.name.trim())                    errs.name = 'Full name is required.'
    if (!form.email.trim())                   errs.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address.'
    if (!form.password)                       errs.password = 'Password is required.'
    else if (form.password.length < 8)        errs.password = 'Password must be at least 8 characters.'
    if (form.password !== form.password_confirmation) errs.password_confirmation = 'Passwords do not match.'

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    setErrors({})
    setGlobalError('')
    setSuccess('')

    try {
      const res  = await fetch(`${baseURL}/api/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          password_confirmation: form.password_confirmation,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        // Map backend validation errors
        if (data.errors) {
          const mapped = {}
          if (data.errors.name)                  mapped.name = data.errors.name[0]
          if (data.errors.email)                 mapped.email = data.errors.email[0]
          if (data.errors.password)              mapped.password = data.errors.password[0]
          if (data.errors.password_confirmation) mapped.password_confirmation = data.errors.password_confirmation[0]
          setErrors(mapped)
        } else {
          throw new Error(data.message || 'Failed to create admin account.')
        }
        return
      }

      setSuccess(`Admin account for "${data.admin.email}" created successfully!`)
      setForm({ name: '', email: '', password: '', password_confirmation: '' })
      if (onSuccess) onSuccess(data.admin)
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {success && (
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-emerald-700 text-sm font-medium">{success}</p>
        </div>
      )}

      {globalError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-red-600 text-xs font-medium">{globalError}</p>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Full Name</label>
        <input
          type="text"
          placeholder="Jane Smith"
          value={form.name}
          onChange={set('name')}
          className={inputCls(errors.name)}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Email Address</label>
        <input
          type="email"
          placeholder="newadmin@example.com"
          value={form.email}
          onChange={set('email')}
          className={inputCls(errors.email)}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={set('password')}
            className={inputCls(errors.password) + ' pr-11'}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600 transition"
            tabIndex={-1}
          >
            <EyeIcon visible={showPw} />
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Confirm Password</label>
        <div className="relative">
          <input
            type={showPw2 ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={form.password_confirmation}
            onChange={set('password_confirmation')}
            className={inputCls(errors.password_confirmation) + ' pr-11'}
          />
          <button
            type="button"
            onClick={() => setShowPw2((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600 transition"
            tabIndex={-1}
          >
            <EyeIcon visible={showPw2} />
          </button>
        </div>
        {errors.password_confirmation && (
          <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#3d4f45] hover:bg-[#303f37] text-white font-bold py-2.5 rounded-lg text-sm transition shadow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Admin
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-stone-600 hover:text-stone-800 border border-stone-300 hover:border-stone-400 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

// ─── MAIN EXPORT: AdminLogin page (login only — shown when NOT authenticated) ──
export default function AdminLogin({ onBack, onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f17] via-[#1a2e22] to-[#0c1a12] flex flex-col items-center justify-center px-4 py-16 font-sans">
      {/* Subtle grid pattern overlay */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header banner */}
          <div className="bg-gradient-to-r from-[#3d4f45] to-[#2a3b31] px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                <img
                  src="/logo.jpeg"
                  alt="Elements Title Group"
                  className="h-16 w-auto object-contain brightness-0 invert"
                />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-stone-300 text-sm mt-1 font-light">
              Secure access to order management &amp; settings
            </p>
          </div>

          {/* Form body */}
          <div className="px-8 py-8">
            {/* Security badge */}
            <div className="flex items-center gap-2 mb-6 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-[#3d4f45] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-stone-600 font-medium">Authorized personnel only</span>
            </div>

            <LoginForm onLogin={onLogin} onBack={onBack} />
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-stone-500 text-xs mt-5">
          Elements Title &amp; Trust Group &bull; Admin Access
        </p>
      </div>
    </div>
  )
}

// ─── NAMED EXPORT: SignupForm for use inside Admin Dashboard ───────────────
export { SignupForm }

