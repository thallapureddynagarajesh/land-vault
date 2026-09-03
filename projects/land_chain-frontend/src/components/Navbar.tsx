import React, { useState } from 'react'
import { ShieldCheck, Building2, Search, Store, UserCheck, Wallet, Activity, Copy, Check, X } from 'lucide-react'

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
  const [showSearchModal, setShowSearchModal] = useState(false)

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
    setShowSearchModal(false)
  }

  const handleClearSearch = () => {
    setLocalSearch('')
    if (onSearchChange) {
      onSearchChange('')
    }
  }

  const navItems: { id: 'search' | 'upload' | 'marketplace' | 'portfolio' | 'government'; label: string; icon: any }[] = [
    { id: 'search', label: 'Verify', icon: Search },
    { id: 'upload', label: 'Upload Deed', icon: Building2 },
    { id: 'marketplace', label: 'Marketplace', icon: Store },
    { id: 'portfolio', label: 'My Portfolio', icon: Building2 },
    { id: 'government', label: 'Gov Portal', icon: UserCheck },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-12 gap-1.5 sm:gap-3">
          {/* 1. Left: Brand Identity */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer select-none"
            onClick={() => setActiveTab('search')}
          >
            <div className="h-7 w-7 rounded-lg bg-earth-700 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-stone-900">
                Land<span className="text-earth-600">Vault</span>
              </span>
              <span className="hidden xl:inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-earth-50 text-earth-800 border border-earth-200/80">
                Algorand
              </span>
            </div>
          </div>

          {/* 2. Center: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-0.5 bg-stone-100/90 p-0.5 rounded-lg border border-stone-200/90">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-earth-600 text-white shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* 3. Right: Search Trigger, Role Selector & Wallet Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Compact inline search on wide screens */}
            <form onSubmit={handleSearchSubmit} className="relative hidden xl:flex items-center">
              <div className="relative">
                <Search className="w-3 h-3 text-stone-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="PIN / Survey..."
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value)
                    if (onSearchChange) onSearchChange(e.target.value)
                  }}
                  className="w-28 focus:w-36 pl-6 pr-4 py-1 rounded-md bg-stone-50 border border-stone-200 text-[11px] text-stone-700 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-earth-600/50 transition-all font-mono"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Quick search icon button on medium screens */}
            <button
              onClick={() => setShowSearchModal(!showSearchModal)}
              className="xl:hidden p-1.5 rounded-md bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors cursor-pointer"
              title="Search Land Records"
            >
              <Search className="w-3.5 h-3.5 text-stone-600" />
            </button>

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-stone-50 px-1.5 py-0.5 rounded-md border border-stone-200 text-[11px]">
              <span className="text-stone-400 text-[10px] mr-1 hidden sm:inline">Role:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="bg-transparent text-earth-800 font-semibold focus:outline-none cursor-pointer text-[11px]"
              >
                <option value="citizen" className="bg-white text-stone-700">Citizen</option>
                <option value="registrar" className="bg-white text-stone-700">Registrar (Gov)</option>
                <option value="investor" className="bg-white text-stone-700">Investor</option>
              </select>
            </div>

            {/* Always-Visible Wallet Connection Button */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={onConnectWalletClick}
                className="px-2.5 sm:px-3 py-1 rounded-md text-[11px] font-semibold bg-earth-600 hover:bg-earth-700 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                <Wallet className="w-3 h-3 text-white shrink-0" />
                {connectedAddress ? (
                  <span className="font-mono text-white text-[11px]">
                    {connectedAddress.slice(0, 4)}...{connectedAddress.slice(-4)}
                  </span>
                ) : (
                  <span>Connect Wallet</span>
                )}
              </button>

              {connectedAddress && (
                <button
                  onClick={handleCopyNavbarAddress}
                  title="Copy Wallet Address"
                  className="p-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200 transition-all cursor-pointer shrink-0"
                >
                  {copiedNavbarAddress ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-1 border-t border-stone-100 gap-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-earth-600 text-white font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Quick Search Modal Popover for smaller desktop / tablet screens */}
        {showSearchModal && (
          <div className="xl:hidden pb-2 pt-1 border-t border-stone-100 animate-in fade-in duration-150">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Parcel PIN, Survey Number, Location..."
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value)
                    if (onSearchChange) onSearchChange(e.target.value)
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-earth-600/50 font-mono"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-earth-600 hover:bg-earth-700 text-white text-xs font-semibold"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
