import React, { useState } from 'react'
import { Store, Tag, MapPin, ExternalLink, ShoppingCart, Filter, ArrowUpDown, ShieldCheck, CreditCard, CheckCircle2, RefreshCw, X, Wallet, ArrowRight } from 'lucide-react'
import { LandParcel } from '../interfaces/land'

interface LandMarketplaceProps {
  parcels: LandParcel[]
  onBuyLand: (parcelId: string, priceAlgos: number, sellerAddress: string) => void
  onDelistLand: (parcelId: string) => void
  onOpenAuditTrail: (parcelId: string) => void
  connectedAddress: string | null
}

export const LandMarketplace: React.FC<LandMarketplaceProps> = ({
  parcels,
  onBuyLand,
  onDelistLand,
  onOpenAuditTrail,
  connectedAddress,
}) => {
  const [selectedType, setSelectedType] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'priceAsc' | 'priceDesc' | 'newest'>('newest')

  // Atomic Buy Payment Modal State
  const [buyingParcel, setBuyingParcel] = useState<LandParcel | null>(null)
  const [isProcessingBuy, setIsProcessingBuy] = useState(false)
  const [confirmedTxId, setConfirmedTxId] = useState<string | null>(null)

  // Filter listed parcels
  const listedParcels = parcels.filter((p) => p.isForSale)

  const filteredParcels = listedParcels.filter((p) => {
    if (selectedType === 'All') return true
    return p.propertyType === selectedType
  })

  const sortedParcels = [...filteredParcels].sort((a, b) => {
    if (sortBy === 'priceAsc') return a.priceMicroAlgos - b.priceMicroAlgos
    if (sortBy === 'priceDesc') return b.priceMicroAlgos - a.priceMicroAlgos
    return b.createdAt - a.createdAt
  })

  const handleConfirmPurchase = async () => {
    if (!buyingParcel) return

    setIsProcessingBuy(true)
    const priceAlgos = buyingParcel.priceMicroAlgos / 1e6

    // Simulate Algorand Atomic Transaction Payment Group execution (~1.2s)
    await new Promise((r) => setTimeout(r, 1200))

    const txId = `TX-BUY-${buyingParcel.parcelId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    setConfirmedTxId(txId)

    // Execute title transfer
    onBuyLand(buyingParcel.parcelId, priceAlgos, buyingParcel.owner)
    setIsProcessingBuy(false)
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 lg:p-8 rounded-3xl border border-amber-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">Algorand Atomic Land Marketplace</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                  Atomic Settlement
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Buy & sell authenticated real-estate parcels with instant ALGO payment transfer & atomic title handover.</p>
            </div>
          </div>

          <div className="bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-slate-500">Active Listings:</span>{' '}
            <span className="text-amber-400 font-bold">{listedParcels.length} Parcels</span>
          </div>
        </div>
      </div>

      {/* Filter & Sort Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Classification Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {['All', 'Residential', 'Commercial', 'Agricultural', 'Industrial'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedType === type
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 text-white text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest Listed</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Marketplace Cards Grid */}
      {sortedParcels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedParcels.map((parcel) => {
            const priceAlgos = parcel.priceMicroAlgos / 1e6
            const isOwner = connectedAddress && connectedAddress.toLowerCase() === parcel.owner.toLowerCase()

            return (
              <div
                key={parcel.parcelId}
                className="glass-card glass-card-hover p-6 rounded-3xl border border-slate-800 flex flex-col justify-between relative group"
              >
                {/* Badge Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-lg font-bold text-white tracking-wide">{parcel.parcelId}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Gov Authenticated
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    {parcel.location}
                  </p>

                  {/* Specs Box */}
                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Type</span>
                      <span className="font-semibold text-slate-200">{parcel.propertyType}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Plot Area</span>
                      <span className="font-mono font-bold text-white">{parcel.areaSqft.toLocaleString()} sq.ft</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Current Owner</span>
                      <span className="font-mono text-[11px] text-slate-300">
                        {parcel.owner.slice(0, 4)}...{parcel.owner.slice(-4)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Action Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 font-medium">Listing Price</span>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-white font-mono">{priceAlgos.toLocaleString()}</span>
                      <span className="text-xs font-bold text-amber-400 ml-1.5 font-mono">ALGO</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <button
                        onClick={() => onDelistLand(parcel.parcelId)}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                      >
                        Delist My Property
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setBuyingParcel(parcel)
                          setConfirmedTxId(null)
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" /> Buy Property Instant
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <button
                      onClick={() => onOpenAuditTrail(parcel.parcelId)}
                      className="hover:text-emerald-400 underline cursor-pointer transition-colors"
                    >
                      Audit Trail
                    </button>
                    <a
                      href={`https://ipfs.io/ipfs/${parcel.documentHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-cyan-400 flex items-center gap-1"
                    >
                      Deed Doc <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-400 border border-slate-800">
          <Tag className="w-12 h-12 mx-auto mb-3 text-slate-500" />
          <h3 className="text-base font-semibold text-white">No properties currently listed in this category</h3>
          <p className="text-xs text-slate-400 mt-1">Check back soon or select another classification filter above.</p>
        </div>
      )}

      {/* Atomic Payment Confirmation Modal */}
      {buyingParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg rounded-3xl border border-amber-500/40 overflow-hidden shadow-2xl space-y-6">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Algorand Atomic Payment Authorization</h3>
                  <p className="text-xs text-slate-400">Atomic ALGO Payment & Title Deed Handover Protocol</p>
                </div>
              </div>
              <button
                onClick={() => setBuyingParcel(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 pt-0">
              {confirmedTxId ? (
                <div className="py-4 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <div>
                    <h4 className="text-lg font-bold text-white">Payment Successful & Title Handed Over!</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      You are now the official verified titleholder of <strong>{buyingParcel.parcelId}</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300 break-all">
                    Tx ID: {confirmedTxId}
                  </div>

                  <button
                    onClick={() => setBuyingParcel(null)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Close & View In My Portfolio
                  </button>
                </div>
              ) : (
                <>
                  {/* Property Payment Receipt Specs */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Parcel ID</span>
                      <span className="font-bold text-white">{buyingParcel.parcelId}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Location</span>
                      <span className="text-slate-300 truncate max-w-[200px]">{buyingParcel.location}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Seller Wallet</span>
                      <span className="text-amber-300">
                        {buyingParcel.owner.slice(0, 6)}...{buyingParcel.owner.slice(-4)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Buyer Wallet</span>
                      <span className="text-emerald-300">
                        {connectedAddress
                          ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
                          : 'BUYER_ACTIVE_WALLET'}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 pt-3 border-t border-slate-800 text-sm">
                      <span className="text-slate-300 font-bold font-sans">Total Payment Amount</span>
                      <div className="text-right">
                        <span className="font-extrabold text-amber-400 text-lg">
                          {(buyingParcel.priceMicroAlgos / 1e6).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-amber-400 ml-1">ALGO</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
                    <Wallet className="w-5 h-5 shrink-0 text-amber-400" />
                    <span>
                      Clicking <strong>Authorize Payment</strong> transfers <strong>{(buyingParcel.priceMicroAlgos / 1e6).toLocaleString()} ALGO</strong> directly to the seller address and updates smart contract Box Storage in 1 atomic transaction.
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setBuyingParcel(null)}
                      className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingBuy}
                      onClick={handleConfirmPurchase}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingBuy ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Signing & Transferring ALGO...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" /> Authorize Payment ({(buyingParcel.priceMicroAlgos / 1e6).toLocaleString()} ALGO)
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
