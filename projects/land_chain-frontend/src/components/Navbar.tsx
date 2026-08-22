import React, { useState } from 'react'
import { ShieldCheck, Building2, Search, Store, UserCheck, Wallet, ChevronRight, Activity, Copy, Check, X } from 'lucide-react'

interface NavbarProps {
  activeTab: 'search' | 'upload' | 'marketplace' | 'portfolio' | 'government'
  setActiveTab: (tab: 'search' | 'upload' | 'marketplace' | 'portfolio' | 'government') => void
  userRole: 'citizen' | 'registrar' | 'investor'
  setUserRole: (role: 'citizen' | 'registrar' | 'investor') => void
  connectedAddress: string | null
  onConnectWalletClick: () => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  connectedAddress,
  onConnectWalletClick,
  searchQuery = '',
  onSearchChange,
}) => {
  const [copiedNavbarAddress, setCopiedNavbarAddress] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)

  const handleCopyNavbarAddress = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (connectedAddress) {
      navigator.clipboard.writeText(connectedAddress)
      setCopiedNavbarAddress(true)
      setTimeout(() => setCopiedNavbarAddress(false), 2000)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearchChange) {
      onSearchChange(localSearch)
    }
    setActiveTab('search')
  }

  const handleClearSearch = () => {
    setLocalSearch('')
    if (onSearchChange) {
      onSearchChange('')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-earth-200/50 px-4 lg:px-8 py-3 space-y-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('search')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-earth-700 via-earth-600 to-earth-400 p-0.5 shadow-lg shadow-earth-600/15">
              <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-earth-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-stone-800">Land<span className="gradient-text-emerald">Vault</span></span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full bg-earth-600/10 text-earth-600 border border-earth-600/20 flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 animate-pulse" /> Algorand + IPFS
                </span>
              </div>
              <p className="text-xs text-stone-400">Decentralized IPFS Land Record Management</p>
            </div>
          </div>

          {/* Wallet Trigger Mobile */}
          <button
            onClick={onConnectWalletClick}
            className="md:hidden px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-earth-600 border border-stone-200 flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5" />
            {connectedAddress ? `${connectedAddress.slice(0, 4)}...${connectedAddress.slice(-4)}` : 'Wallet'}
          </button>
        </div>

        {/* Global Top Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md flex items-center relative">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-earth-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Parcel ID, Survey No (e.g. SURVEY-123), or Location..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value)
                if (onSearchChange) onSearchChange(e.target.value)
              }}
              className="w-full pl-10 pr-9 py-2 rounded-xl glass-input text-xs text-stone-700 placeholder-stone-400 focus:outline-none focus:border-earth-600/50 transition-all font-mono"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="ml-2 px-3.5 py-2 rounded-xl bg-earth-600 hover:bg-earth-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-colors shadow-md cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
        </form>

        {/* Right Section: Role Switcher & Wallet */}
        <div className="hidden md:flex items-center gap-3">
          {/* Role selector */}
          <div className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 text-xs">
            <span className="text-stone-400 font-medium">Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="bg-transparent text-earth-600 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="citizen" className="bg-white text-stone-700">Citizen / Landowner</option>
              <option value="registrar" className="bg-white text-stone-700">Gov Registrar Authority</option>
              <option value="investor" className="bg-white text-stone-700">Market Investor</option>
            </select>
          </div>

          {/* Connect Wallet Button & Copy Action */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onConnectWalletClick}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-stone-50 text-earth-600 border border-stone-200 shadow-sm flex items-center gap-2 transition-all hover:border-earth-600/30 cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-earth-600" />
              {connectedAddress ? (
                <span className="font-mono text-earth-700">
                  {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                </span>
              ) : (
                <span>Connect Wallet</span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {connectedAddress && (
              <button
                onClick={handleCopyNavbarAddress}
                title="Copy Connected Wallet Address"
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-earth-600 border border-stone-200 transition-all cursor-pointer flex items-center justify-center"
              >
                {copiedNavbarAddress ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-stone-400" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <nav className="flex items-center gap-1 bg-stone-100/90 p-1.5 rounded-xl border border-stone-200/80 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-earth-700 to-earth-600 text-white shadow-md shadow-earth-600/15 font-semibold'
                : 'text-stone-500 hover:text-stone-700 hover:bg-white/80'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Title Verification
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-earth-700 to-earth-600 text-white shadow-md shadow-earth-600/15 font-semibold'
                : 'text-stone-500 hover:text-stone-700 hover:bg-white/80'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Upload Land Document
          </button>

          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'marketplace'
                ? 'bg-gradient-to-r from-earth-700 to-earth-600 text-white shadow-md shadow-earth-600/15 font-semibold'
                : 'text-stone-500 hover:text-stone-700 hover:bg-white/80'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Marketplace
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'portfolio'
                ? 'bg-gradient-to-r from-earth-700 to-earth-600 text-white shadow-md shadow-earth-600/15 font-semibold'
                : 'text-stone-500 hover:text-stone-700 hover:bg-white/80'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            My Portfolio
          </button>

          <button
            onClick={() => setActiveTab('government')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'government'
                ? 'bg-gradient-to-r from-earth-700 to-earth-600 text-white shadow-md shadow-earth-600/15 font-semibold'
                : 'text-stone-500 hover:text-stone-700 hover:bg-white/80'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Gov Portal
          </button>
        </nav>
      </div>
    </header>
  )
}
