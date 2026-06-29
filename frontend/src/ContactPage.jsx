import { useState } from 'react'

export default function ContactPage({ onBack, onOrderClick, contactEmail = 'orders@example.com', contactPhone = '254-400-8926' }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    signUp: false,
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'Required'
    if (!form.lastName.trim()) errs.lastName = 'Required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required'
    if (!form.subject.trim()) errs.subject = 'Required'
    if (!form.message.trim()) errs.message = 'Required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitted(true)
  }

  const inputClass = (field) =>
    `w-full border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3d4f45] transition bg-white ${
      errors[field] ? 'border-red-400' : 'border-stone-400'
    }`

  // ── Success ──────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f0ede0] flex flex-col">
        {/* Header */}
        <header className="bg-[#26382f] border-b border-white/10 shadow-lg py-3 px-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center">
            <img
              src="/logo.jpeg"
              alt="Elements Title Group"
              className="h-24 w-auto object-contain brightness-0 invert"
            />
          </button>
          <button
            onClick={onOrderClick}
            className="bg-white hover:bg-stone-100 text-stone-900 text-sm font-semibold px-5 py-2 transition"
          >
            Order Title
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-[#3d4f45] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-stone-800 mb-3">Message Sent!</h2>
            <p className="text-stone-600 text-sm leading-relaxed mb-6">
              Thank you for reaching out. Our team will get back to you shortly. For urgent matters, call us at <strong>{contactPhone}</strong>.
            </p>
            <button
              onClick={onBack}
              className="bg-[#3d4f45] hover:bg-[#303f37] text-white font-semibold py-2.5 px-8 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main page ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0ede0] font-sans flex flex-col">

      <header className="bg-[#26382f] border-b border-white/10 shadow-lg py-3 px-6 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center">
          <img
            src="/logo.jpeg"
            alt="Elements Title Group"
            className="h-24 sm:h-32 w-auto object-contain"
            style={{ filter: 'invert(1)' }}
          />
        </button>
        <button
          onClick={onOrderClick}
          className="bg-white hover:bg-stone-100 text-stone-900 text-sm font-semibold px-5 py-2 transition"
        >
          Order Title
        </button>
      </header>

      {/* Page content */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-16">

        {/* Title */}
        <h1 className="text-4xl font-light text-stone-800 text-center mb-14 tracking-wide">
          Contact Us
        </h1>

        <form onSubmit={handleSubmit} noValidate>

          {/* Name */}
          <div className="mb-6">
            <p className="text-sm text-stone-700 mb-2">Name</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={set('firstName')}
                  className={inputClass('firstName')}
                />
                <p className="text-xs text-stone-500 mt-1">
                  First Name{' '}
                  <span className="italic text-stone-400">(required)</span>
                </p>
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.firstName}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={set('lastName')}
                  className={inputClass('lastName')}
                />
                <p className="text-xs text-stone-500 mt-1">
                  Last Name{' '}
                  <span className="italic text-stone-400">(required)</span>
                </p>
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm text-stone-700 mb-1">
              Email <span className="italic text-stone-400 text-xs">(required)</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              className={inputClass('email')}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Newsletter checkbox */}
          <div className="mb-6 flex items-center gap-2">
            <input
              id="signup"
              type="checkbox"
              checked={form.signUp}
              onChange={(e) => setForm((prev) => ({ ...prev, signUp: e.target.checked }))}
              className="w-4 h-4 border border-stone-400 rounded accent-[#3d4f45] cursor-pointer"
            />
            <label htmlFor="signup" className="text-sm text-stone-600 cursor-pointer">
              Sign up for news and updates
            </label>
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="block text-sm text-stone-700 mb-1">
              Subject <span className="italic text-stone-400 text-xs">(required)</span>
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={set('subject')}
              className={inputClass('subject')}
            />
            {errors.subject && (
              <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Message */}
          <div className="mb-8">
            <label className="block text-sm text-stone-700 mb-1">
              Message <span className="italic text-stone-400 text-xs">(required)</span>
            </label>
            <textarea
              rows={6}
              value={form.message}
              onChange={set('message')}
              className={`${inputClass('message')} resize-y`}
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">{errors.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#3d4f45] hover:bg-[#303f37] active:bg-[#253328] text-white font-semibold py-2.5 px-12 transition text-sm tracking-wide"
            >
              Submit
            </button>
          </div>

        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-300/50 bg-[#f0ede0] py-10 px-6 text-center">
        <h2 className="text-lg font-bold tracking-[0.25em] text-stone-800 mb-3">
          ELEMENTS TITLE GROUP
        </h2>
        <p className="text-sm text-stone-600 max-w-md mx-auto mb-5 leading-relaxed">
          Questions, quotes, or a new order?{' '}
          <span className="text-blue-600">Tell us what you need,</span> and our team will move fast to{' '}
          <span className="text-blue-600">make it happen.</span>
        </p>
        <div className="flex flex-col gap-2 text-sm text-stone-850 font-medium">
          <p>
            Contact us through email:{' '}
            <a
              href={`mailto:${contactEmail}`}
              className="underline hover:text-[#3d4f45] transition font-bold"
            >
              {contactEmail}
            </a>
          </p>
          <p>
            Text us through:{' '}
            <a href={`tel:${contactPhone.replace(/[^0-9]/g, '')}`} className="underline hover:text-[#3d4f45] transition font-bold">
              {contactPhone}
            </a>
          </p>
        </div>
      </footer>

    </div>
  )
}

