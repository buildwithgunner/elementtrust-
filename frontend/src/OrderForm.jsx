import { useState, useRef } from 'react'

export default function OrderForm({ onBack, contactEmail = 'orders@example.com', contactPhone = '(352) 450-3211' }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    streetAddress2: '',
    city: '',
    state: '',
    zip: '',
    coAgent: '',
    party: '',
    otherFirstName: '',
    otherLastName: '',
    otherEmail: '',
    otherPhone: '',
    vacantLand: '',
    financing: '',
    hoa: '',
    referral: '',
    notes: '',
  })
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const fileInputRef = useRef(null)

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }



  const handleFiles = (newFiles) => {
    setFiles((prev) => [...prev, ...Array.from(newFiles)])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'Required'
    if (!form.lastName.trim()) errs.lastName = 'Required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required'
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Valid phone required'
    if (!form.streetAddress.trim()) errs.streetAddress = 'Required'
    if (!form.city.trim()) errs.city = 'Required'
    if (!form.state.trim()) errs.state = 'Required'
    if (!form.zip.trim()) errs.zip = 'Required'
    if (!form.coAgent) errs.coAgent = 'Required'
    if (!form.party) errs.party = 'Required'
    if (!form.otherFirstName.trim()) errs.otherFirstName = 'Required'
    if (!form.otherLastName.trim()) errs.otherLastName = 'Required'
    if (!form.otherEmail.trim() || !/\S+@\S+\.\S+/.test(form.otherEmail)) errs.otherEmail = 'Valid email required'
    if (!form.otherPhone.trim() || form.otherPhone.replace(/\D/g, '').length < 10) errs.otherPhone = 'Valid phone required'
    if (!form.vacantLand) errs.vacantLand = 'Required'
    if (!form.hoa) errs.hoa = 'Required'
    if (!form.referral) errs.referral = 'Required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // scroll to first error
      const firstErr = document.querySelector('.field-error')
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    
    setSubmitting(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      
      // Map frontend camelCase to backend snake_case
      const mapping = {
        firstName: 'first_name',
        lastName: 'last_name',
        email: 'email',
        phone: 'phone',
        streetAddress: 'street_address',
        streetAddress2: 'street_address2',
        city: 'city',
        state: 'state',
        zip: 'zip',
        coAgent: 'co_agent',
        party: 'party',
        otherFirstName: 'other_first_name',
        otherLastName: 'other_last_name',
        otherEmail: 'other_email',
        otherPhone: 'other_phone',
        vacantLand: 'vacant_land',
        financing: 'financing',
        hoa: 'hoa',
        referral: 'referral',
        notes: 'notes'
      }

      Object.keys(form).forEach(key => {
        const backendKey = mapping[key] || key
        formData.append(backendKey, form[key] || '')
      })

      // Append files
      files.forEach((file) => {
        formData.append('files[]', file)
      })

      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })

      const resData = await response.json()

      if (!response.ok) {
        if (response.status === 422 && resData.errors) {
          // Map backend validation errors (snake_case) to frontend validation errors (camelCase)
          const mappedErrors = {}
          const reverseMapping = {
            first_name: 'firstName',
            last_name: 'lastName',
            email: 'email',
            phone: 'phone',
            street_address: 'streetAddress',
            street_address2: 'streetAddress2',
            city: 'city',
            state: 'state',
            zip: 'zip',
            co_agent: 'coAgent',
            party: 'party',
            other_first_name: 'otherFirstName',
            other_last_name: 'otherLastName',
            other_email: 'otherEmail',
            other_phone: 'otherPhone',
            vacant_land: 'vacantLand',
            financing: 'financing',
            hoa: 'hoa',
            referral: 'referral',
            notes: 'notes'
          }
          
          Object.keys(resData.errors).forEach(bk => {
            const fk = reverseMapping[bk] || bk
            mappedErrors[fk] = resData.errors[bk][0]
          })
          setErrors(mappedErrors)
          
          // Scroll to first error
          setTimeout(() => {
            const firstErr = document.querySelector('.field-error')
            if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 100)
          
          throw new Error('Please check the highlighted fields.')
        } else {
          throw new Error(resData.message || 'Failed to submit order.')
        }
      }

      setSubmitted(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  )

  const Input = ({ field, type = 'text', hint, phoneFormat, placeholder = '' }) => {
    const handlePhoneInput = (e) => {
      let val = e.target.value.replace(/\D/g, '')
      if (val.length > 10) val = val.substring(0, 10)
      let formatted = val
      if (val.length > 3) {
        formatted = `(${val.substring(0, 3)}) ${val.substring(3)}`
      }
      if (val.length > 6) {
        formatted = `(${val.substring(0, 3)}) ${val.substring(3, 6)}-${val.substring(6)}`
      }
      setForm(prev => ({ ...prev, [field]: formatted }))
    }

    return (
      <div>
        <input
          type={type}
          value={form[field]}
          onChange={phoneFormat ? handlePhoneInput : set(field)}
          placeholder={placeholder}
          className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 transition bg-white ${
            errors[field] ? 'border-red-400' : 'border-stone-300'
          }`}
        />
        {hint && <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">{hint}</p>}
        {errors[field] && (
          <p className="text-red-500 text-xs mt-1 field-error">{errors[field]}</p>
        )}
      </div>
    )
  }

  const RadioGroup = ({ field, options }) => (
    <div className="flex flex-col gap-2 mt-2">
      {options.map((opt) => (
        <label key={opt} className="inline-flex items-center text-sm text-stone-700 cursor-pointer">
          <input
            type="radio"
            name={field}
            value={opt}
            checked={form[field] === opt}
            onChange={set(field)}
            className="w-4 h-4 text-[#1e3a5f] border-stone-300 focus:ring-[#1e3a5f]/40 mr-2"
          />
          {opt}
        </label>
      ))}
      {errors[field] && (
        <p className="text-red-500 text-xs field-error">{errors[field]}</p>
      )}
    </div>
  )

  const Select = ({ field, options, placeholder = 'Please Select' }) => (
    <div>
      <select
        value={form[field]}
        onChange={set(field)}
        className={`w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 transition bg-white ${
          errors[field] ? 'border-red-400' : 'border-stone-300'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {errors[field] && (
        <p className="text-red-500 text-xs mt-1 field-error">{errors[field]}</p>
      )}
    </div>
  )

  // ── Success screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#eef0f8] flex flex-col items-center justify-center px-4 py-10 sm:py-16">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 sm:p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-3">Order Submitted!</h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-4">
            Thank you! Your title order has been received. Our team will be in touch shortly.
          </p>
          <p className="text-stone-600 text-sm leading-relaxed mb-4">
            If you have any questions, reach out to us:
          </p>
          <div className="flex flex-col gap-3 mb-6 bg-stone-50 p-4 rounded-lg border border-stone-200/50">
            <div className="text-stone-700 text-sm">
              Contact us through email: <a href={`mailto:${contactEmail}`} className="text-blue-600 font-semibold hover:underline block mt-0.5">{contactEmail}</a>
            </div>
            <div className="text-stone-700 text-sm">
              Text us through: <a href={`tel:${contactPhone.replace(/[^0-9]/g, '')}`} className="text-stone-850 font-bold hover:underline block mt-0.5">{contactPhone}</a>
            </div>
          </div>
          <button
            onClick={onBack}
            className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-2.5 px-8 rounded transition w-full sm:w-auto"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#eef0f8] font-sans">
      <header className="bg-[#0f1f17] border-b border-white/10 py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-between shadow-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-stone-100 hover:text-white transition font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Elements Title & Trust Group"
            className="h-24 sm:h-32 w-auto object-contain"
            style={{ filter: 'invert(1)' }}
          />
        </div>

        <div className="w-12 sm:w-24" /> {/* spacer */}
      </header>

      {/* Form container */}
      <main className="max-w-2xl mx-auto py-6 sm:py-10 px-3 sm:px-4">
        <form onSubmit={handleSubmit} noValidate>

          {/* Title card */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-4 sm:p-7 mb-4 sm:mb-5">
            <h1 className="text-2xl font-bold text-[#1e3a5f] mb-3">Title Order Submission Form</h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Hello superstar agent!!! Thank you for choosing{' '}
              <span className="text-blue-600 font-medium">Elements Title Group</span> as your{' '}
              <span className="text-blue-600 font-medium">Title Company</span> today!!! Please fill
              out this form to submit your title order to us. If you have any question, don't
              hesitate to{' '}
              <span className="text-blue-600 font-medium">reach out to us at {contactPhone}</span>.
            </p>
          </div>

          {/* Your Name */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-4 sm:p-7 mb-4 sm:mb-5">
            <Label required>Your Name</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <Input field="firstName" placeholder="" />
                <p className="text-blue-500 text-xs mt-1">First Name</p>
              </div>
              <div>
                <Input field="lastName" placeholder="" />
                <p className="text-blue-500 text-xs mt-1">Last Name</p>
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-4 sm:p-7 mb-4 sm:mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label required>Email</Label>
                <Input field="email" type="email" hint="example@example.com" />
              </div>
              <div>
                <Label required>Phone Number</Label>
                <Input field="phone" placeholder="(000) 000-0000" hint="Please enter a valid phone number." phoneFormat />
              </div>
            </div>
          </div>

          {/* Subject Property Address */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-4 sm:p-7 mb-4 sm:mb-5">
            <Label required>Subject Property Address</Label>
            <div className="flex flex-col gap-3 mt-2">
              <div>
                <Input field="streetAddress" />
                <p className="text-blue-500 text-xs mt-1">Street Address</p>
              </div>
              <div>
                <Input field="streetAddress2" />
                <p className="text-blue-500 text-xs mt-1">Street Address Line 2</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input field="city" />
                  <p className="text-blue-500 text-xs mt-1">City</p>
                </div>
                <div>
                  <Input field="state" />
                  <p className="text-blue-500 text-xs mt-1">State / Province</p>
                </div>
              </div>
              <div>
                <Input field="zip" />
                <p className="text-blue-500 text-xs mt-1">Postal / Zip Code</p>
              </div>
            </div>
          </div>

          {/* Co-Agent */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-4 sm:p-7 mb-4 sm:mb-5">
            <Label required>Is there a Co-Listing/Co-Buyer Agent?</Label>
            <RadioGroup field="coAgent" options={['Yes', 'No']} />
          </div>

          {/* Party representation */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-4 sm:p-7 mb-4 sm:mb-5">
            <Label required>Which party do you represent?</Label>
            <div className="mt-2">
              <Select
                field="party"
                options={["Buyer's Agent", "Seller's Agent", "Dual Agent", "Transaction Coordinator"]}
              />
            </div>
          </div>

          {/* Other Party Agent Info */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-4 sm:p-7 mb-4 sm:mb-5">
            <Label required>Other Party's Agent Contact Information</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 mb-4">
              <div>
                <Input field="otherFirstName" />
                <p className="text-blue-500 text-xs mt-1">First Name</p>
              </div>
              <div>
                <Input field="otherLastName" />
                <p className="text-blue-500 text-xs mt-1">Last Name</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Email</Label>
                <Input field="otherEmail" type="email" hint="example@example.com" />
              </div>
              <div>
                <Label required>Phone Number</Label>
                <Input field="otherPhone" placeholder="(000) 000-0000" hint="Please enter a valid phone number." phoneFormat />
              </div>
            </div>
          </div>

          {/* Vacant Land + Financing */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-4 sm:p-7 mb-4 sm:mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <Label required>Vacant Land?</Label>
                <RadioGroup field="vacantLand" options={['Yes', 'No']} />
              </div>
              <div>
                <Label>Type of Financing on the Transaction</Label>
                <div className="mt-2">
                  <Select
                    field="financing"
                    options={['Cash', 'Conventional', 'FHA', 'VA', 'USDA', 'Hard Money / Private', 'Other']}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* HOA + Referral */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-4 sm:p-7 mb-4 sm:mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <Label required>Is there an HOA?</Label>
                <RadioGroup field="hoa" options={['Yes', 'No']} />
              </div>
              <div>
                <Label required>Is there a referral agreement for this transaction?</Label>
                <RadioGroup field="referral" options={['Yes', 'No']} />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-4 sm:p-7 mb-4 sm:mb-5">
            <p className="text-sm font-semibold text-stone-700 mb-3">
              Please upload all docs{' '}
              <span className="text-blue-600 font-normal">
                (Contract, Addendums, Compensation Agreement, Pre-Approval letter, Referral Agreement, etc.)
              </span>
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center gap-3 cursor-pointer transition ${
                dragging ? 'border-blue-400 bg-blue-50' : 'border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100'
              }`}
            >
              <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.045 11.095" />
              </svg>
              <div className="text-center">
                <p className="font-semibold text-stone-700">Browse Files</p>
                <p className="text-sm text-stone-400">Drag and drop files here</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Uploaded files list */}
            {files.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm">
                    <span className="text-stone-700 truncate max-w-[80%]">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-stone-400 hover:text-red-500 transition ml-2 font-bold text-lg leading-none"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-4 sm:p-7 mb-4 sm:mb-5">
            <Label>Is there anything we should know?</Label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={5}
              className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 transition mt-2 resize-none"
            />
            <p className="text-blue-500 text-xs mt-1">
              Client preferences, divorce, death, probate, foreclosure, etc.
            </p>
          </div>

          {/* Error notice */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 mb-6 text-center max-w-lg mx-auto">
              {submitError}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-center pb-10">
            <button
              type="submit"
              disabled={submitting}
              className={`bg-[#2ea84e] hover:bg-[#27943f] active:bg-[#1f7a35] text-white font-semibold py-3 px-16 rounded-lg shadow transition-all duration-150 hover:shadow-md text-base ${
                submitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting Order...
                </span>
              ) : 'Submit'}
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}

