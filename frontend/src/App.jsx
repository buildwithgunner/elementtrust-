import { useState, useEffect } from 'react'
import OrderForm from './OrderForm'
import ContactPage from './ContactPage'
import AdminDashboard from './AdminDashboard'

// Locally hosted real estate images for background slideshow
const BACKGROUND_IMAGES = [
  '/hero1.png',
  '/hero2.png',
  '/hero3.png',
  '/florida.png',
]
const TEAM_MEMBERS = [
  {
    name: 'Seth Matthew, ESQ.',
    role: 'Escrow Managing Director',
    image: '/seth-matthew.jpeg',
    bio: [
      'Seth is an experienced leader in the field of real estate law who has a strong work ethic and a mindset of service excellence. Seth was born in New York but grew up in Florida where he earned his bachelor\'s degree from The University of Florida and his Juris Doctorate Degree from St. Thomas University School of Law. Seth has been a member in good standing of the Florida Bar since 1994.',
      'In addition to the practice of law, Seth owned and operated several title insurance companies specializing in both residential and commercial transactions where he developed his expertise in business operations and fostering staff and client relations.',
      'Seth is skilled in the areas of settlement negotiations, contract and addenda preparation and review, realtor transactional support, probate, foreclosure matters, and the reviewing and clearing title issues. Seth has been married to his beautiful wife Sharry for 33 years and they have two sons, Daniel, and Jonathan.',
    ],
  },
  {
    name: 'Ben Finley',
    role: 'Director of Sales and Marketing',
    image: '/ben-finley.png',
    bio: [
      'Ben has been living in South Florida since 2001 and has been in the title industry since 2013. Originally from Indiana, he is a graduate of Indiana University and a die hard Indiana Hoosier fan. When he is not at the closing table, chances are you will find him on a golf course.',
      'A competitive golfer since he was 8 years old, Ben continues to play in golf tournaments throughout the state of Florida when his schedule permits. Ben has extensive knowledge and experience in the areas of residential and commercial closings, for sale by-owner transactions, short sales, investor transactions and refinances.',
      'He is a notary public and prides himself on closing all of his transactions. Ben believes that constant communication throughout the transaction is the key to a successful closing.',
      '"The longer I live, the more I realize that the true mark you can leave on this world is by how many people you have helped along the way. Helping people achieve the American Dream and guiding them through the closing process is a true blessing in my life."',
    ],
  },
  {
    name: 'Amanda Assif',
    role: 'Account Executive & Notary Public',
    location: 'Elements Title and Escrow | Celebration, FL',
    image: '/amanda-assif.png',
    bio: [
      'With over six years of experience in the real estate market, Amanda Assif brings a wealth of knowledge and expertise to her role. Her career is supported by an impressive ten years of experience in customer service, event planning, and marketing, making her a versatile and highly skilled professional.',
      'Amanda has also excelled in leadership positions, having served as a trainer and supervisor for major organizations such as Booking.com, Chase Bank, and Hilton Grand Vacations. This unique blend of customer service, management, and real estate knowledge enables Amanda to effectively serve her clients and create seamless experiences in her current role.',
    ],
  },
]

function App() {
  const [page, setPage] = useState('home') // 'home' | 'order' | 'contact'
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isQuoteVisible, setIsQuoteVisible] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [contactEmail, setContactEmail] = useState('orders@example.com')
  const [contactPhone, setContactPhone] = useState('(352) 450-3211')

  useEffect(() => {
    fetch('http://localhost:8000/api/settings')
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('Failed to fetch settings')
      })
      .then((data) => {
        if (data.email) setContactEmail(data.email)
        if (data.phone) setContactPhone(data.phone)
      })
      .catch((err) => console.error('Error fetching settings:', err))
  }, [])

  // Form states for quote calculator
  const [purchasePrice, setPurchasePrice] = useState(350000)
  const [loanAmount, setLoanAmount] = useState(280000)
  const [stateName, setStateName] = useState('Georgia')

  // Custom navigation logic to sync with browser URL history without page reload
  const navigate = (targetPage) => {
    let url = '/'
    if (targetPage === 'admin') {
      url = '/admin/login'
    } else if (targetPage === 'order') {
      url = '/order'
    } else if (targetPage === 'contact') {
      url = '/contact'
    }
    window.history.pushState({}, '', url)
    setPage(targetPage)
  }

  // Handle browser Back / Forward navigation and initial routing setup
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      const params = new URLSearchParams(window.location.search)
      if (params.get('admin') === 'true' || path === '/admin' || path === '/admin/login' || path.startsWith('/admin')) {
        setPage('admin')
      } else if (path === '/order') {
        setPage('order')
      } else if (path === '/contact') {
        setPage('contact')
      } else {
        setPage('home')
      }
    }

    window.addEventListener('popstate', handlePopState)
    handlePopState() // Set initial page on load

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Automatically cycle background images every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  // Basic calculation for title/escrow fees
  const calculateFees = () => {
    const settlementFee = 450
    const titleSearch = 250
    const titleInsurance = Math.round(purchasePrice * 0.005)
    const recordingFees = 150
    const total = settlementFee + titleSearch + titleInsurance + recordingFees
    return { settlementFee, titleSearch, titleInsurance, recordingFees, total }
  }

  const fees = calculateFees()

  // Smooth scroll handler
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Show order form page (after all hooks)
  if (page === 'order') {
    return (
      <OrderForm
        onBack={() => navigate('home')}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
      />
    )
  }

  // Show contact page (after all hooks)
  if (page === 'contact') {
    return (
      <ContactPage
        onBack={() => navigate('home')}
        onOrderClick={() => navigate('order')}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
      />
    )
  }

  // Show admin dashboard
  if (page === 'admin') {
    return (
      <AdminDashboard
        onBack={() => navigate('home')}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        onSettingsUpdate={(email, phone) => {
          setContactEmail(email)
          setContactPhone(phone)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf6] text-stone-800 font-sans antialiased relative">
      {/* 1. HERO SECTION (WITH ROTATING BACKGROUND) */}
      <section className="relative z-10 h-[85vh] md:h-[90vh] overflow-hidden flex flex-col justify-between">
        {/* Background Images with smooth transitions */}
        {BACKGROUND_IMAGES.map((image, index) => (
          <div
            key={image}
            style={{ backgroundImage: `url('${image}')` }}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/45 z-10" />

        {/* Navigation Bar */}
        <header className="relative w-full px-6 py-4 flex items-center justify-between z-20 bg-[#0f1f17] shadow-xl">
          {/* Logo container */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('home')}>
            <img
              src="/logo.png"
              alt="Elements Title &amp; Trust Group"
              className="h-28 md:h-36 w-auto object-contain"
              style={{ filter: 'invert(1)' }}
            />
          </div>

          {/* Nav Links + CTA */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollToSection('services')}
              className="hidden md:inline text-stone-300 hover:text-white text-sm font-medium transition"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('team')}
              className="hidden md:inline text-stone-300 hover:text-white text-sm font-medium transition"
            >
              Team
            </button>
            <button
              onClick={() => navigate('contact')}
              className="hidden md:inline text-stone-300 hover:text-white text-sm font-medium transition"
            >
              Contact
            </button>
            <button
              onClick={() => navigate('order')}
              className="hidden md:inline bg-white hover:bg-stone-100 text-stone-900 font-semibold px-5 py-2.5 rounded text-sm transition shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Open New Order
            </button>

            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-stone-300 hover:text-white focus:outline-none p-1"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-[#0f1f17] border-b border-white/10 z-30 shadow-2xl flex flex-col py-4 px-6 md:hidden gap-4 animate-fade-in">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  scrollToSection('services')
                }}
                className="text-stone-300 hover:text-white text-left text-sm font-medium py-2 border-b border-white/5"
              >
                Services
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  scrollToSection('team')
                }}
                className="text-stone-300 hover:text-white text-left text-sm font-medium py-2 border-b border-white/5"
              >
                Team
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  navigate('contact')
                }}
                className="text-stone-300 hover:text-white text-left text-sm font-medium py-2 border-b border-white/5"
              >
                Contact
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  navigate('order')
                }}
                className="bg-white hover:bg-stone-100 text-stone-900 font-semibold px-5 py-3 rounded text-sm text-center transition shadow-md"
              >
                Open New Order
              </button>
            </div>
          )}
        </header>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-6 w-full flex-grow flex flex-col justify-center items-center text-center z-20">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight max-w-5xl shadow-sm">
            Your Trusted Title & Real Estate Settlement Partner
          </h1>
          <p className="text-base md:text-xl text-stone-200 max-w-3xl mt-6 font-light leading-relaxed">
            Closings made simple, secure, and stress-free—whether it's in Georgia, Florida, or right on the beach.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full max-w-md justify-center">
            <button
              onClick={() => navigate('order')}
              className="bg-white hover:bg-stone-50 text-stone-900 font-semibold py-4 px-8 rounded shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Open New Order
            </button>
            <button
              onClick={() => navigate('contact')}
              className="bg-white hover:bg-stone-50 text-stone-900 font-semibold py-4 px-8 rounded shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Small spacer at bottom of hero */}
        <div className="h-10 w-full" />
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="bg-[#fafaf6] pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#3d4f45] mb-8 tracking-tight">
            We're here to help you thrive!
          </h2>
          <p className="text-base md:text-lg text-stone-600 leading-relaxed max-w-3xl mx-auto mb-12">
            At Elements Title Group, we provide title, escrow, and settlement services statewide. Whether you're buying your first home in Miami, refinancing in Orlando, or closing on an investment in Macon, we're here to make the process simple, secure, and stress-free. We are licensed in Florida & Georgia with over 20+ years of experience. We know your real estate closing is one of the most important transactions of your life; that's why we sweat the small stuff, so you don't have to.
          </p>

          {/* Checkmarks list styled like screenshot */}
          <div className="flex flex-col items-center">
            <ul className="inline-flex flex-col gap-4 text-left text-stone-700 font-medium text-base md:text-lg max-w-xl mx-auto">
              <li className="flex items-start gap-3">
                <span className="text-[#3d4f45] font-extrabold text-xl leading-none">✓</span>
                <span>Attorney-reviewed title searches in Georgia</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#3d4f45] font-extrabold text-xl leading-none">✓</span>
                <span>Remote & hybrid closings (We will literally close you ANYWHERE!)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#3d4f45] font-extrabold text-xl leading-none">✓</span>
                <span>Title insurance for buyers, sellers, and lenders</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#3d4f45] font-extrabold text-xl leading-none">✓</span>
                <span>Instant net sheets & fast quotes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#3d4f45] font-extrabold text-xl leading-none">✓</span>
                <span>Investor & builder-friendly workflows</span>
              </li>
            </ul>

            {/* Learn More Button matching screenshot */}
            <button
              onClick={() => scrollToSection('services')}
              className="mt-16 bg-[#3d4f45] hover:bg-[#303f37] text-white font-semibold py-3 px-8 rounded shadow transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Learn more
            </button>
          </div>
        </div>
      </section>

      {/* 3. SERVICES SECTION: "Everything You Need for a Smooth Closing" */}
      <section
        id="services"
        className="relative py-24 px-6 overflow-hidden flex flex-col justify-center items-center text-white bg-cover bg-center"
        style={{
          backgroundImage: `url('/services-bg.png')`,
        }}
      >
        {/* Dark mask overlay for readibility */}
        <div className="absolute inset-0 bg-[#3d4f45]/85 mix-blend-multiply z-0" />
        <div className="absolute inset-0 bg-stone-900/60 z-0" />

        <div className="relative max-w-6xl mx-auto w-full z-10 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-16">
            Everything You Need for a Smooth Closing
          </h2>

          {/* Grid Layout (3 Columns, 2 Rows) */}
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12 text-center">
            {/* Box 1 */}
            <div className="flex flex-col items-center px-4">
              <h3 className="text-xl md:text-2xl font-bold mb-3">Title Search & Examination</h3>
              <p className="text-sm md:text-base text-stone-300 leading-relaxed max-w-xs font-light">
                Accurate history reviews with attorney sign-off in Georgia and streamlined examinations in Florida.
              </p>
            </div>
            {/* Box 2 */}
            <div className="flex flex-col items-center px-4">
              <h3 className="text-xl md:text-2xl font-bold mb-3">Title Insurance</h3>
              <p className="text-sm md:text-base text-stone-300 leading-relaxed max-w-xs font-light">
                Owner's and lender's policies to protect equity and lending interests statewide.
              </p>
            </div>
            {/* Box 3 */}
            <div className="flex flex-col items-center px-4">
              <h3 className="text-xl md:text-2xl font-bold mb-3">Escrow & Settlement</h3>
              <p className="text-sm md:text-base text-stone-300 leading-relaxed max-w-xs font-light">
                Secure funds management and smooth coordination from contract to keys.
              </p>
            </div>
            {/* Box 4 */}
            <div className="flex flex-col items-center px-4">
              <h3 className="text-xl md:text-2xl font-bold mb-3">Seller Net Sheets & Quotes</h3>
              <p className="text-sm md:text-base text-stone-300 leading-relaxed max-w-xs font-light">
                Quick, transparent numbers to help sellers and agents plan ahead.
              </p>
            </div>
            {/* Box 5 */}
            <div className="flex flex-col items-center px-4">
              <h3 className="text-xl md:text-2xl font-bold mb-3">Investor & Builder Services</h3>
              <p className="text-sm md:text-base text-stone-300 leading-relaxed max-w-xs font-light">
                Volume-friendly processes for new construction, fix-and-flip, and refinancing.
              </p>
            </div>
            {/* Box 6 */}
            <div className="flex flex-col items-center px-4">
              <h3 className="text-xl md:text-2xl font-bold mb-3">Remote & Hybrid Closings</h3>
              <p className="text-sm md:text-base text-stone-300 leading-relaxed max-w-xs font-light">
                In-person, mobile, or online, closing anywhere so that it fits into your lifestyle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TEAM SECTION */}
      <section id="team" className="bg-[#fafaf6] py-24 px-6 border-t border-stone-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#44a77e] mb-3">
              Our Team
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#3d4f45] tracking-tight mb-5">
              Meet the people behind your closing
            </h2>
            <p className="text-base md:text-lg text-stone-600 leading-relaxed">
              Experienced title, escrow, and client service professionals guiding every file with care, communication, and local expertise.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {TEAM_MEMBERS.map((member) => (
              <article
                key={member.name}
                className="bg-white border border-stone-200/80 rounded-lg shadow-sm overflow-hidden flex flex-col h-full"
              >
                <div className="aspect-[4/5] bg-stone-100 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-6 md:p-7 flex flex-col flex-grow">
                  <div className="pb-5 mb-5 border-b border-stone-200">
                    <h3 className="text-2xl font-extrabold text-[#3d4f45] leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-sm font-bold uppercase tracking-wider text-[#44a77e] mt-2">
                      {member.role}
                    </p>
                    {member.location && (
                      <p className="text-sm text-stone-500 mt-2">
                        {member.location}
                      </p>
                    )}
                  </div>
                  <div className="space-y-4 text-sm leading-relaxed text-stone-600 font-light">
                    {member.bio.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      {/* 5. LICENSED IN GEORGIA & FLORIDA (LOCATIONS) */}
      <section className="bg-[#fafaf6] py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#3d4f45] mb-4 tracking-tight">
            Licensed in Georgia & Florida And Other States 
          </h2>
          <p className="text-lg text-stone-600 font-light mb-2 max-w-3xl mx-auto">
            From city skylines to sandy shores—our team makes closing happen wherever you are.
          </p>
          <p className="text-sm md:text-base text-stone-500 max-w-4xl mx-auto mb-16 leading-relaxed">
            Serving all of Georgia and Florida with licensed offices and mobile closings to meet the needs of REALTORS&reg;, lenders, buyers, sellers, and investors.
          </p>

          {/* Grid: 3 columns (Atlanta Image | Addresses Block | Florida Image) */}
          <div className="grid md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {/* Atlanta Image (Left) */}
            <div className="h-[320px] rounded-lg overflow-hidden shadow-lg border border-stone-200">
              <div
                style={{
                  backgroundImage: `url('/atlanta.png')`,
                }}
                className="w-full h-full bg-cover bg-center hover:scale-105 transition duration-500"
              />
            </div>

            {/* Address Block (Middle) */}
            <div className="bg-[#f5f5f0] border border-stone-200/60 p-8 rounded-lg shadow-sm space-y-6 text-stone-800">
              <p className="text-stone-500 font-light text-sm italic">If you'd like to close at one of our locations:</p>
              
              <h3 className="text-xl font-bold uppercase tracking-wider text-[#3d4f45] border-b pb-2 border-stone-300">
                Locations
              </h3>

              <div className="text-sm leading-relaxed">
                <p className="font-bold text-stone-900 mb-1">Georgia Office:</p>
                <p className="italic text-stone-700">3639 Lawrenceville Highway, Unit A,</p>
                <p className="italic text-stone-700">Lawrenceville, GA, 30044</p>
              </div>

              <div className="text-sm leading-relaxed">
                <p className="font-bold text-stone-900 mb-1">Florida Office:</p>
                <p className="font-semibold text-[#3d4f45] mb-0.5">Main Office Ocala:</p>
                <p className="italic text-stone-700">948 NE 3rd ST, Ocala, FL, 34470</p>
              </div>
            </div>

            {/* Florida Beach Image (Right) */}
            <div className="h-[320px] rounded-lg overflow-hidden shadow-lg border border-stone-200">
              <div
                style={{
                  backgroundImage: `url('/florida.png')`,
                }}
                className="w-full h-full bg-cover bg-center hover:scale-105 transition duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. STATE DETAILED COVERAGE SECTION */}
      <section className="bg-[#fafaf6] py-16 px-6 border-t border-stone-200/50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 text-left">
          {/* Georgia Details */}
          <div className="bg-[#fbfbf9]/80 border border-stone-200/40 p-8 rounded-lg shadow-sm">
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#3d4f45] mb-4">Georgia</h3>
            <p className="text-sm md:text-base text-stone-600 leading-relaxed font-light">
              Across the state of Georgia, from Atlanta and Savannah to beyond Augusta and Macon, our attorney partners deliver closings that come to you. Whether you prefer to meet at your home, office, the beach, or even the mountains, we bring the attorney-reviewed closing process directly to your doorstep. It's personal, compliant, and built around your schedule.
            </p>
          </div>

          {/* Florida Details */}
          <div className="bg-[#fbfbf9]/80 border border-stone-200/40 p-8 rounded-lg shadow-sm">
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#3d4f45] mb-4">Florida</h3>
            <p className="text-sm md:text-base text-stone-600 leading-relaxed font-light">
              In Florida, flexibility is everything. Our team supports closings from Miami to Jacksonville, Orlando to Tampa, and everywhere in between. Choose what works best for you: in-person service or Remote Online Notarization (RON) where permitted. With statewide coverage and modern tools, your Florida closing fits seamlessly into your life.
            </p>
          </div>
        </div>
      </section>

      {/* 7. CONTACT SECTION (ABOVE FOOTER) */}
      <section className="bg-[#fafaf6] py-20 px-6 border-t border-stone-200/50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-widest text-[#3d4f45]">
            ELEMENTS TITLE & TRUST GROUP
          </h2>
          <p className="text-stone-600 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Questions, quotes, or a new order? Tell us what you need, and our team will move fast to make it happen.
          </p>

          <div className="flex flex-col gap-3 items-center pt-4 font-bold text-base md:text-lg text-[#3d4f45]">
            <p>
              Contact us through email:{' '}
              <a
                href={`mailto:${contactEmail}`}
                className="underline hover:text-[#2d3a33] transition font-extrabold"
              >
                {contactEmail}
              </a>
            </p>
            <p>
              Text us through:{' '}
              <a
                href={`tel:${contactPhone.replace(/[^0-9]/g, '')}`}
                className="underline hover:text-[#2d3a33] transition font-extrabold"
              >
                {contactPhone}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3d4f45] text-stone-300 py-12 px-6 border-t border-stone-850 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Elements Title & Trust Group"
              className="h-20 w-auto object-contain opacity-95"
              style={{ filter: 'invert(1)' }}
            />
          </div>
          <p className="text-sm text-stone-400">
            &copy; 2026 Elements Title Group. Licensed in Florida & Georgia. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 8. WIDGETS & POPUPS (BOTTOM-RIGHT) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {/* Quote Pop-up Box */}
        {isQuoteVisible && (
          <div className="bg-white text-stone-800 rounded-lg shadow-xl border border-stone-100 py-3 px-5 flex items-center gap-3 animate-fade-in-up">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-semibold hover:text-[#3d4f45] transition whitespace-nowrap"
            >
              Get an instant closing quote
            </button>
            <button
              onClick={() => setIsQuoteVisible(false)}
              className="text-stone-400 hover:text-stone-600 font-bold text-xs p-1"
              aria-label="Close quote notification"
            >
              &times;
            </button>
          </div>
        )}

        {/* Floating Action Button (FAB) */}
        <button
          onClick={() => {
            setIsModalOpen(true)
            setIsQuoteVisible(true) // re-open tooltip if dismissed
          }}
          className="w-12 h-12 bg-[#44a77e] hover:bg-[#39906c] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition transform hover:scale-105 active:scale-95"
          aria-label="Instant closing calculator"
        >
          <svg
            className="w-6 h-6 fill-none stroke-current stroke-2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>

      {/* 9. MODALS */}

      {/* INSTANT CLOSING QUOTE CALCULATOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-100 transform transition-all animate-scale-in">
            {/* Modal Header */}
            <div className="bg-[#3d4f45] text-white py-5 px-6 flex justify-between items-center">
              <h3 className="text-lg font-bold">Instant Closing Fee Estimate</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white text-2xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Property State
                </label>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full border border-stone-300 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3d4f45]/50 bg-white"
                >
                  <option value="Georgia">Georgia</option>
                  <option value="Florida">Florida</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Purchase Price ($)
                </label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3d4f45]/50"
                  step="5000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Loan Amount ($)
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3d4f45]/50"
                  step="5000"
                />
              </div>

              {/* Estimates summary */}
              <div className="bg-stone-50 border border-stone-100 rounded-lg p-4 mt-6">
                <h4 className="font-bold text-stone-700 text-sm mb-3 border-b pb-2 border-stone-200">
                  Estimated Fee Breakdown ({stateName})
                </h4>
                <div className="space-y-2 text-sm text-stone-600">
                  <div className="flex justify-between">
                    <span>Settlement & Escrow Fee:</span>
                    <span className="font-medium">${fees.settlementFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Title Search & Exam:</span>
                    <span className="font-medium">${fees.titleSearch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Title Insurance:</span>
                    <span className="font-medium">${fees.titleInsurance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Government Recording Fees:</span>
                    <span className="font-medium">${fees.recordingFees}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#3d4f45] border-t pt-3 mt-2">
                    <span>Estimated Total:</span>
                    <span>${fees.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 py-4 px-6 flex justify-end gap-3 border-t border-stone-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-[#3d4f45] hover:bg-[#303f37] text-white font-semibold py-2 px-5 rounded text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW ORDER PAGE — handled by full-page OrderForm component via page state */}

      {/* CONTACT US MODAL */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-100 transform transition-all animate-scale-in">
            <div className="bg-[#3d4f45] text-white py-5 px-6 flex justify-between items-center">
              <h3 className="text-lg font-bold">Contact Elements Title Group</h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-white/80 hover:text-white text-2xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); setIsContactModalOpen(false); }} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Full Name</label>
                <input required type="text" className="w-full border border-stone-300 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3d4f45]/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Email Address</label>
                <input required type="email" className="w-full border border-stone-300 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3d4f45]/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">How can we help?</label>
                <textarea required rows="4" className="w-full border border-stone-300 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3d4f45]/50 resize-none"></textarea>
              </div>
              <button type="submit" className="w-full mt-4 bg-[#3d4f45] hover:bg-[#303f37] text-white font-bold py-3 px-4 rounded transition shadow">
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App









