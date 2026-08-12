import React, { useState } from 'react'
import { Store, Tag, MapPin, ExternalLink, ShoppingCart, Filter, ArrowUpDown, ShieldCheck } from 'lucide-react'
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
                  Zero Trust Settlement
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Buy & sell authenticated real-estate parcels with instant payment transfer & atomic title handover (~2.8s finality).</p>
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
                        onClick={() => onBuyLand(parcel.parcelId, priceAlgos, parcel.owner)}
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
    </div>
  )
}
