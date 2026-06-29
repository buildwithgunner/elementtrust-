import { useState, useEffect } from 'react'
import { getApiBaseUrl } from './lib/apiBase'
import AdminLogin, { SignupForm } from './AdminLogin'

const baseURL = getApiBaseUrl()


export default function AdminDashboard({ onBack, contactEmail = 'orders@example.com', contactPhone = '254-400-8926', onSettingsUpdate }) {
  const [token, setToken] = useState(localStorage.getItem('elements_admin_auth_token') || '')
  const [admin, setAdmin] = useState(() => {
    const storedAdmin = localStorage.getItem('elements_admin')
    return storedAdmin ? JSON.parse(storedAdmin) : null
  })
  const [authorized, setAuthorized] = useState(false)
  const [activeTab, setActiveTab] = useState('orders') // 'orders' | 'settings' | 'admins'

  const [settingsEmail, setSettingsEmail] = useState(contactEmail)
  const [settingsPhone, setSettingsPhone] = useState(contactPhone)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState('')

  useEffect(() => {
    if (contactEmail) setSettingsEmail(contactEmail)
    if (contactPhone) setSettingsPhone(contactPhone)
  }, [contactEmail, contactPhone])
  
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingStatusId, setUpdatingStatusId] = useState(null)
  
  // Verify admin token on mount or token change
  useEffect(() => {
    if (token) {
      verifyTokenAndFetch(token)
    }
  }, [token])

  const adminHeaders = () => ({
    'Authorization': `Bearer ${token}`,
  })

  const verifyTokenAndFetch = async (adminToken) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${baseURL}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          setAuthorized(false)
          localStorage.removeItem('elements_admin_auth_token')
          localStorage.removeItem('elements_admin')
          throw new Error('Invalid admin session')
        }
        throw new Error('Failed to load orders.')
      }
      
      const data = await response.json()
      setOrders(data.orders || [])
      setAuthorized(true)
    } catch (err) {
      setError(err.message)
      setAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (adminData, adminToken) => {
    localStorage.setItem('elements_admin_auth_token', adminToken)
    localStorage.setItem('elements_admin', JSON.stringify(adminData))
    setAdmin(adminData)
    setToken(adminToken)
    setAuthorized(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('elements_admin_auth_token')
    localStorage.removeItem('elements_admin')
    setAdmin(null)
    setToken('')
    setAuthorized(false)
    setOrders([])
    setSelectedOrder(null)
  }

  // Update status action
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatusId(orderId)
    try {
      const response = await fetch(`${baseURL}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          ...adminHeaders(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const resData = await response.json()
      
      // Update state
      setOrders(prev => prev.map(o => o.id === orderId ? resData.order : o))
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(resData.order)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdatingStatusId(null)
    }
  }

  // Save Settings action
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    setSettingsMessage('')
    try {
      const response = await fetch(`${baseURL}/api/admin/settings`, {
        method: 'PATCH',
        headers: {
          ...adminHeaders(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: settingsEmail.trim(),
          phone: settingsPhone.trim()
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update settings')
      }

      setSettingsMessage('Settings saved successfully!')
      if (onSettingsUpdate) {
        onSettingsUpdate(settingsEmail.trim(), settingsPhone.trim())
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingSettings(false)
    }
  }

  // Delete action
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this order? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${baseURL}/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          ...adminHeaders(),
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete order')
      }

      setOrders(prev => prev.filter(o => o.id !== orderId))
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null)
      }
      alert('Order deleted successfully.')
    } catch (err) {
      alert(err.message)
    }
  }

  // Filter and search calculations
  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    const name = `${o.first_name} ${o.last_name}`.toLowerCase()
    const email = (o.email || '').toLowerCase()
    const city = (o.city || '').toLowerCase()
    const query = search.toLowerCase()
    const matchesSearch = name.includes(query) || email.includes(query) || city.includes(query)
    return matchesStatus && matchesSearch
  })

  // Statistics
  const stats = {
    total: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    closed: orders.filter(o => o.status === 'closed').length,
  }

  // Render separate admin login if not authorized
  if (!authorized) {
    return <AdminLogin onBack={onBack} onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] font-sans text-stone-800 flex flex-col">
      {/* Header */}
      <header className="bg-[#26382f] border-b border-white/10 sticky top-0 z-30 shadow-lg px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="Elements Logo"
            className="h-24 w-auto object-contain"
            style={{ filter: 'invert(1)' }}
          />
          <div className="h-6 w-px bg-white/25 hidden sm:block" />
          <h1 className="text-lg font-bold text-white tracking-tight">Admin Order Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {admin && (
            <span className="hidden md:inline text-xs font-semibold text-stone-200">{admin.email}</span>
          )}
          {/* Tab buttons */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`font-semibold text-sm px-4 py-2 rounded transition ${
              activeTab === 'orders'
                ? 'bg-white/20 text-white border border-white/25 shadow-sm'
                : 'text-stone-300 hover:text-white border border-transparent'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`font-semibold text-sm px-4 py-2 rounded transition ${
              activeTab === 'settings'
                ? 'bg-white/20 text-white border border-white/25 shadow-sm'
                : 'text-stone-300 hover:text-white border border-transparent'
            }`}
          >
            Site Settings
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`font-semibold text-sm px-4 py-2 rounded transition ${
              activeTab === 'admins'
                ? 'bg-white/20 text-white border border-white/25 shadow-sm'
                : 'text-stone-300 hover:text-white border border-transparent'
            }`}
          >
            Manage Admins
          </button>
          <div className="h-6 w-px bg-white/25 hidden sm:block mx-1" />
          <button
            onClick={onBack}
            className="text-stone-100 hover:text-white font-semibold text-sm px-4 py-2 rounded border border-white/25 hover:bg-white/10 transition"
          >
            Client Website
          </button>
          <button
            onClick={handleLogout}
            className="bg-[#c2410c] hover:bg-[#9a3412] text-white font-semibold text-sm px-4 py-2 rounded shadow transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-[1600px] w-full mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 text-lg leading-none" aria-label="Close error message">&times;</button>
          </div>
        )}
        {activeTab === 'admins' ? (
          <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-6 sm:p-8 max-w-2xl mx-auto w-full mt-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#3d4f45]/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#3d4f45]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800">Create New Admin Account</h2>
                <p className="text-xs text-stone-500">Add a trusted team member with full dashboard access.</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-amber-700 text-xs font-medium">
                New admin accounts will have full access to orders, settings, and admin management. Only share access with trusted staff.
              </p>
            </div>

            <SignupForm token={token} />
          </div>
        ) : activeTab === 'settings' ? (
          <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-6 sm:p-8 max-w-2xl mx-auto w-full mt-6">
            <h2 className="text-xl font-bold text-stone-850 mb-2">Manage Site Contact Information</h2>
            <p className="text-sm text-stone-500 mb-6">
              Update the contact email and phone number displayed across the Elements Title Group client website.
            </p>

            {settingsMessage && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded p-4 text-sm mb-6 flex justify-between items-center">
                <span>{settingsMessage}</span>
                <button onClick={() => setSettingsMessage('')} className="text-green-600 font-bold px-2 py-1" aria-label="Close message">&times;</button>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Contact Email Address
                </label>
                <input
                  type="email"
                  required
                  value={settingsEmail}
                  onChange={(e) => setSettingsEmail(e.target.value)}
                  className="w-full border border-stone-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d4f45]/50 bg-white"
                  placeholder="orders@example.com"
                />
                <p className="text-[11px] text-stone-400 mt-1">This email is used on the home page, contact page, and order submission success screens.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Text / Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                  className="w-full border border-stone-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d4f45]/50 bg-white"
                  placeholder="254-400-8926"
                />
                <p className="text-[11px] text-stone-400 mt-1">This phone/text number is displayed for phone calls and SMS reach-outs.</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-stone-100">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-[#3d4f45] hover:bg-[#303f37] text-white font-semibold py-3 px-8 rounded shadow transition disabled:opacity-50 text-sm"
                >
                  {savingSettings ? 'Saving Changes...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Analytics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
                <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">Total Orders</p>
                <p className="text-3xl font-extrabold text-stone-800 mt-1">{stats.total}</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
                <p className="text-amber-500 text-xs font-bold uppercase tracking-wider">New Orders</p>
                <p className="text-3xl font-extrabold text-stone-800 mt-1">{stats.new}</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
                <p className="text-blue-500 text-xs font-bold uppercase tracking-wider">In Progress</p>
                <p className="text-3xl font-extrabold text-stone-800 mt-1">{stats.inProgress}</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
                <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Closed Orders</p>
                <p className="text-3xl font-extrabold text-stone-800 mt-1">{stats.closed}</p>
              </div>
            </div>

        {/* Interactive Controls (Search & Filters) */}
        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by client name, email, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-stone-300 rounded pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d4f45]/50 bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap">Filter Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d4f45]/50 bg-white"
            >
              <option value="all">All Orders</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Dashboard Split View */}
        <div className="grid lg:grid-cols-5 gap-6 items-start flex-grow">
          {/* Left Column: Orders List */}
          <div className={`lg:col-span-3 bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden h-[700px] flex-col ${selectedOrder ? 'hidden lg:flex' : 'flex'}`}>
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-stone-700">Orders ({filteredOrders.length})</h2>
              {loading && <p className="text-xs text-[#3d4f45] animate-pulse">Refreshing...</p>}
            </div>
            
            <div className="overflow-y-auto flex-grow">
              {filteredOrders.length === 0 ? (
                <div className="py-20 text-center text-stone-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-sm">No orders matching the current filter.</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {filteredOrders.map(order => {
                    const isSelected = selectedOrder && selectedOrder.id === order.id;
                    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`px-6 py-4 cursor-pointer hover:bg-stone-50 transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          isSelected ? 'bg-stone-100 border-l-4 border-[#3d4f45]' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#3d4f45]">{order.first_name} {order.last_name}</span>
                            <span className="text-stone-400 text-xs">• {order.party}</span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5 truncate max-w-sm">
                            {order.street_address}, {order.city}, {order.state}
                          </p>
                          <p className="text-stone-400 text-[11px] mt-1">{orderDate}</p>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-auto">
                          {/* Status Badge */}
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${
                            order.status === 'new' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            order.status === 'in_progress' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>

                          <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Detail View */}
          <div className={`lg:col-span-2 bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden h-[700px] flex-col ${selectedOrder ? 'flex' : 'hidden lg:flex'}`}>
            {selectedOrder ? (
              <div className="flex flex-col h-full">
                {/* Detail Header */}
                <div className="bg-[#3d4f45] text-white px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="lg:hidden text-stone-200 hover:text-white p-1 -ml-1 flex items-center justify-center focus:outline-none shrink-0"
                      aria-label="Back to orders list"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="truncate">
                      <h2 className="font-bold text-base leading-tight truncate">Order #{selectedOrder.id}</h2>
                      <p className="text-xs text-stone-300 mt-0.5 truncate">Submitted: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition shadow-sm shrink-0"
                    title="Delete Order"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Detail Scrollable Body */}
                <div className="p-6 overflow-y-auto flex-grow space-y-6 text-sm text-stone-700">
                  {/* Status Controller */}
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Order Status</p>
                      <p className="text-sm font-semibold text-stone-800 mt-0.5">Change progress tracking status:</p>
                    </div>
                    <select
                      value={selectedOrder.status}
                      disabled={updatingStatusId === selectedOrder.id}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      className="border border-stone-300 rounded px-2.5 py-1.5 text-xs font-bold uppercase focus:outline-none bg-white text-stone-700"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Section: Submitter (Agent) */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b pb-1.5 mb-3">Submitter / Agent</h3>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Name</p>
                        <p className="font-semibold text-stone-900">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Party Represented</p>
                        <p className="font-semibold text-stone-900">{selectedOrder.party}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Email</p>
                        <a href={`mailto:${selectedOrder.email}`} className="text-blue-600 underline font-medium break-all">{selectedOrder.email}</a>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Phone</p>
                        <a href={`tel:${selectedOrder.phone}`} className="text-stone-900 font-semibold">{selectedOrder.phone}</a>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Has Co-Agent?</p>
                        <p className="font-semibold text-stone-900">{selectedOrder.co_agent}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section: Property Address */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b pb-1.5 mb-3">Subject Property Address</h3>
                    <div className="bg-stone-50 p-3.5 border border-stone-100 rounded-lg leading-relaxed">
                      <p className="font-bold text-stone-950">{selectedOrder.street_address}</p>
                      {selectedOrder.street_address2 && <p className="text-stone-700">{selectedOrder.street_address2}</p>}
                      <p className="text-stone-800">{selectedOrder.city}, {selectedOrder.state} {selectedOrder.zip}</p>
                    </div>
                  </div>

                  {/* Section: Transaction details */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b pb-1.5 mb-3">Transaction Details</h3>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Vacant Land?</p>
                        <p className="font-semibold text-stone-900">{selectedOrder.vacant_land}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Type of Financing</p>
                        <p className="font-semibold text-stone-900">{selectedOrder.financing || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Has HOA?</p>
                        <p className="font-semibold text-stone-900">{selectedOrder.hoa}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Referral Agreement?</p>
                        <p className="font-semibold text-stone-900">{selectedOrder.referral}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section: Other Party Agent */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b pb-1.5 mb-3">Other Party's Agent Details</h3>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div className="col-span-2">
                        <p className="text-xs text-stone-400 font-medium">Name</p>
                        <p className="font-semibold text-stone-900">
                          {selectedOrder.other_first_name || selectedOrder.other_last_name 
                            ? `${selectedOrder.other_first_name || ''} ${selectedOrder.other_last_name || ''}`.trim()
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Email</p>
                        {selectedOrder.other_email ? (
                          <a href={`mailto:${selectedOrder.other_email}`} className="text-blue-600 underline break-all">{selectedOrder.other_email}</a>
                        ) : <p className="text-stone-400">N/A</p>}
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Phone</p>
                        {selectedOrder.other_phone ? (
                          <a href={`tel:${selectedOrder.other_phone}`} className="text-stone-950 font-semibold">{selectedOrder.other_phone}</a>
                        ) : <p className="text-stone-400">N/A</p>}
                      </div>
                    </div>
                  </div>

                  {/* Section: Notes */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b pb-1.5 mb-3">Notes & Comments</h3>
                    {selectedOrder.notes ? (
                      <p className="bg-stone-50 border border-stone-150 p-3 rounded text-stone-700 italic leading-relaxed whitespace-pre-line text-xs">
                        "{selectedOrder.notes}"
                      </p>
                    ) : (
                      <p className="text-stone-400 italic">No notes provided.</p>
                    )}
                  </div>

                  {/* Section: Attachments */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b pb-1.5 mb-3">Attached Documents ({selectedOrder.files?.length || 0})</h3>
                    {selectedOrder.files && selectedOrder.files.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedOrder.files.map((file, idx) => {
                          const downloadUrl = `${baseURL}${file.path}?token=${token}`;
                          return (
                            <li key={idx} className="flex items-center justify-between border border-stone-200 rounded px-3 py-2 bg-stone-50">
                              <span className="truncate text-stone-700 text-xs max-w-[70%]" title={file.name}>
                                {file.name}
                              </span>
                              <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-[#3d4f45] hover:text-[#2d3a33] underline whitespace-nowrap ml-2 flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="text-stone-400 italic">No files uploaded.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-stone-400">
                <svg className="w-16 h-16 opacity-45 mb-4 text-[#3d4f45]" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-semibold text-stone-600">No Order Selected</p>
                <p className="text-xs max-w-[250px] mt-1">Select an order from the list on the left to inspect its details and attachments.</p>
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  )
}

