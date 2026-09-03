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
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-stone-200/90 relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-earth-50 text-earth-700 border border-earth-200">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900">Algorand Atomic Land Marketplace</h2>
                <span className="px-2 py-0.5 rounded-full bg-earth-50 text-earth-700 border border-earth-200 text-[10px] font-semibold">
                  Atomic Settlement
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">Buy & sell authenticated real-estate parcels with instant ALGO payment transfer & atomic title handover.</p>
            </div>
          </div>

          <div className="bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 text-[11px] font-mono text-stone-600">
            <span className="text-stone-400">Active Listings:</span>{' '}
            <span className="text-earth-700 font-bold">{listedParcels.length} Parcels</span>
          </div>
        </div>
      </div>

      {/* Filter & Sort Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
        {/* Classification Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-stone-500 mr-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {['All', 'Residential', 'Commercial', 'Agricultural', 'Industrial'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedType === type
                  ? 'bg-earth-600 text-white shadow-xs font-semibold'
                  : 'bg-stone-50 text-stone-600 hover:text-stone-800 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-stone-50 text-stone-700 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-stone-200 focus:outline-none cursor-pointer"
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
                className="glass-card glass-card-hover p-6 rounded-3xl border border-stone-200 flex flex-col justify-between relative group"
              >
                {/* Badge Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-lg font-bold text-stone-800 tracking-wide">{parcel.parcelId}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Gov Authenticated
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 flex items-center gap-1.5 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-earth-500 shrink-0" />
                    {parcel.location}
                  </p>

                  {/* Specs Box */}
                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400">Type</span>
                      <span className="font-semibold text-stone-700">{parcel.propertyType}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400">Plot Area</span>
                      <span className="font-mono font-bold text-stone-800">{parcel.areaSqft.toLocaleString()} sq.ft</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-stone-200">
                      <span className="text-stone-400">Current Owner</span>
                      <span className="font-mono text-[11px] text-stone-600">
                        {parcel.owner.slice(0, 4)}...{parcel.owner.slice(-4)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Action Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-stone-400 font-medium">Listing Price</span>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-stone-800 font-mono">{priceAlgos.toLocaleString()}</span>
                      <span className="text-xs font-bold text-earth-700 ml-1.5 font-mono">ALGO</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <button
                        onClick={() => onDelistLand(parcel.parcelId)}
                        className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold border border-stone-200 transition-all cursor-pointer"
                      >
                        Delist My Property
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setBuyingParcel(parcel)
                          setConfirmedTxId(null)
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-earth-700 to-earth-600 hover:from-earth-600 hover:to-earth-500 text-white font-extrabold text-xs shadow-lg shadow-earth-600/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" /> Buy Property Instant
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                    <button
                      onClick={() => onOpenAuditTrail(parcel.parcelId)}
                      className="hover:text-earth-700 underline cursor-pointer transition-colors"
                    >
                      Audit Trail
                    </button>
                    <a
                      href={`https://ipfs.io/ipfs/${parcel.documentHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-earth-700 flex items-center gap-1"
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
        <div className="glass-card p-12 rounded-3xl text-center text-stone-400 border border-stone-200">
          <Tag className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <h3 className="text-base font-semibold text-stone-700">No properties currently listed in this category</h3>
          <p className="text-xs text-stone-400 mt-1">Check back soon or select another classification filter above.</p>
        </div>
      )}

      {/* Atomic Payment Confirmation Modal */}
      {buyingParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg rounded-3xl border border-stone-200 overflow-hidden shadow-2xl space-y-6">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-earth-600/10 text-earth-700 border border-earth-600/15">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-800">Algorand Atomic Payment Authorization</h3>
                  <p className="text-xs text-stone-400">Atomic ALGO Payment & Title Deed Handover Protocol</p>
                </div>
              </div>
              <button
                onClick={() => setBuyingParcel(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 pt-0">
              {confirmedTxId ? (
                <div className="py-4 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                  <div>
                    <h4 className="text-lg font-bold text-stone-800">Payment Successful & Title Handed Over!</h4>
                    <p className="text-xs text-stone-600 mt-1">
                      You are now the official verified titleholder of <strong>{buyingParcel.parcelId}</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 font-mono text-xs text-earth-700 break-all">
                    Tx ID: {confirmedTxId}
                  </div>

                  <button
                    onClick={() => setBuyingParcel(null)}
                    className="w-full py-3 rounded-xl bg-earth-600 hover:bg-earth-500 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Close & View In My Portfolio
                  </button>
                </div>
              ) : (
                <>
                  {/* Property Payment Receipt Specs */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3 font-mono text-xs">
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-400">Parcel ID</span>
                      <span className="font-bold text-stone-800">{buyingParcel.parcelId}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-400">Location</span>
                      <span className="text-stone-700 truncate max-w-[200px]">{buyingParcel.location}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-400">Seller Wallet</span>
                      <span className="text-earth-700">
                        {buyingParcel.owner.slice(0, 6)}...{buyingParcel.owner.slice(-4)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-400">Buyer Wallet</span>
                      <span className="text-green-700">
                        {connectedAddress
                          ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
                          : 'BUYER_ACTIVE_WALLET'}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 pt-3 border-t border-stone-200 text-sm">
                      <span className="text-stone-700 font-bold font-sans">Total Payment Amount</span>
                      <div className="text-right">
                        <span className="font-extrabold text-earth-800 text-lg">
                          {(buyingParcel.priceMicroAlgos / 1e6).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-earth-700 ml-1">ALGO</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
                    <Wallet className="w-5 h-5 shrink-0 text-amber-600" />
                    <span>
                      Clicking <strong>Authorize Payment</strong> transfers <strong>{(buyingParcel.priceMicroAlgos / 1e6).toLocaleString()} ALGO</strong> directly to the seller address and updates smart contract Box Storage in 1 atomic transaction.
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setBuyingParcel(null)}
                      className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingBuy}
                      onClick={handleConfirmPurchase}
                      className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-earth-700 to-earth-600 hover:from-earth-600 hover:to-earth-500 text-white font-extrabold text-xs shadow-lg shadow-earth-600/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
