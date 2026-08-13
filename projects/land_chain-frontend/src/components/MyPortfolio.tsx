import React, { useState } from 'react'
import { Building2, MapPin, Send, Tag, ExternalLink, ShieldCheck, Download, History, Plus, Trash2 } from 'lucide-react'
import { LandParcel } from '../interfaces/land'

interface MyPortfolioProps {
  parcels: LandParcel[]
  connectedAddress: string | null
  onListForSale: (parcelId: string, priceAlgos: number) => void
  onDelistLand: (parcelId: string) => void
  onTransferOwnership: (parcelId: string, recipientAddress: string) => void
  onDeleteLand: (parcelId: string) => void
  onOpenAuditTrail: (parcelId: string) => void
}

export const MyPortfolio: React.FC<MyPortfolioProps> = ({
  parcels,
  connectedAddress,
  onListForSale,
  onDelistLand,
  onTransferOwnership,
  onDeleteLand,
  onOpenAuditTrail,
}) => {
  const [listingParcelId, setListingParcelId] = useState<string | null>(null)
  const [listPriceAlgos, setListPriceAlgos] = useState<string>('')
  const [transferParcelId, setTransferParcelId] = useState<string | null>(null)
  const [recipientAddress, setRecipientAddress] = useState<string>('')

  // Filter owned properties
  const myParcels = connectedAddress
    ? parcels.filter((p) => p.owner.toLowerCase() === connectedAddress.toLowerCase())
    : parcels.slice(0, 2) // Fallback sample properties when viewing

  const handleListSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!listingParcelId || !listPriceAlgos || Number(listPriceAlgos) <= 0) return
    onListForSale(listingParcelId, Number(listPriceAlgos))
    setListingParcelId(null)
    setListPriceAlgos('')
  }

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferParcelId || !recipientAddress || recipientAddress.trim().length < 10) return
    onTransferOwnership(transferParcelId, recipientAddress.trim())
    setTransferParcelId(null)
    setRecipientAddress('')
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 lg:p-8 rounded-3xl border border-teal-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">Landowner Portfolio Dashboard</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-semibold">
                  Personal Holdings
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Manage your certified real-estate holdings, issue sale listings, transfer ownership, or delete records on Algorand.</p>
            </div>
          </div>

          <div className="bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-slate-500">Properties Owned:</span>{' '}
            <span className="text-teal-400 font-bold">{myParcels.length} Deeds</span>
          </div>
        </div>
      </div>

      {/* Holdings Grid */}
      {myParcels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myParcels.map((parcel) => (
            <div key={parcel.parcelId} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-xl font-bold text-white block">{parcel.parcelId}</span>
                    <span className="text-xs text-emerald-400 font-semibold">{parcel.propertyType}</span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      parcel.isForSale ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {parcel.isForSale ? `Listed (${parcel.priceMicroAlgos / 1e6} ALGO)` : 'Secured Title'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                  {parcel.location}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Plot Area</span>
                    <span className="font-mono font-bold text-white">{parcel.areaSqft.toLocaleString()} sq.ft</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Registered Date</span>
                    <span className="font-mono text-slate-300">{new Date(parcel.createdAt * 1000).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">IPFS Document Hash</span>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400">
                    <span className="truncate max-w-[220px]">{parcel.documentHash}</span>
                    <a
                      href={`https://ipfs.io/ipfs/${parcel.documentHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 font-sans"
                    >
                      <ExternalLink className="w-3 h-3" /> View
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  {parcel.isForSale ? (
                    <button
                      onClick={() => onDelistLand(parcel.parcelId)}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Tag className="w-3.5 h-3.5" /> Delist Sale
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setListingParcelId(parcel.parcelId)
                        setTransferParcelId(null)
                      }}
                      className="py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Tag className="w-3.5 h-3.5" /> List for Sale
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setTransferParcelId(parcel.parcelId)
                      setListingParcelId(null)
                    }}
                    className="py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Transfer Title
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenAuditTrail(parcel.parcelId)}
                    className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5 text-emerald-400" /> Audit Trail
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete and deregister parcel '${parcel.parcelId}' from Box Storage?`)) {
                        onDeleteLand(parcel.parcelId)
                      }
                    }}
                    className="py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Record
                  </button>
                </div>
              </div>

              {/* Inline List For Sale Drawer */}
              {listingParcelId === parcel.parcelId && (
                <form onSubmit={handleListSubmit} className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">Set Listing Price in ALGO</span>
                    <button type="button" onClick={() => setListingParcelId(null)} className="text-slate-400 hover:text-white text-xs">
                      Cancel
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.000001"
                    min="0.1"
                    required
                    placeholder="Price (e.g. 250 ALGO)"
                    value={listPriceAlgos}
                    onChange={(e) => setListPriceAlgos(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Confirm Listing On-Chain
                  </button>
                </form>
              )}

              {/* Inline Transfer Ownership Drawer */}
              {transferParcelId === parcel.parcelId && (
                <form onSubmit={handleTransferSubmit} className="p-4 rounded-2xl bg-slate-900 border border-teal-500/30 space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-400">Transfer Deed to Recipient</span>
                    <button type="button" onClick={() => setTransferParcelId(null)} className="text-slate-400 hover:text-white text-xs">
                      Cancel
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Recipient Algorand Wallet Address..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Transfer Property Ownership
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-400 border border-slate-800">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-500" />
          <h3 className="text-base font-semibold text-white">No land titles currently found under this address</h3>
          <p className="text-xs text-slate-400 mt-1">Connect your wallet or ask the Government Registrar to issue a title to your address.</p>
        </div>
      )}
    </div>
  )
}
