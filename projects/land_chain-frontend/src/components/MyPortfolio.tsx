import React, { useState } from 'react'
import { Building2, MapPin, Tag, Send, ExternalLink, History, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Trash2, Eye } from 'lucide-react'
import { LandParcel } from '../interfaces/land'
import { DocumentViewerModal } from './DocumentViewerModal'

interface MyPortfolioProps {
  parcels: LandParcel[]
  onListForSale: (parcelId: string, priceAlgos: number) => void
  onDelistLand: (parcelId: string) => void
  onTransferOwnership: (parcelId: string, newOwnerAddress: string) => void
  onDeleteLand: (parcelId: string) => void
  onOpenAuditTrail: (parcelId: string) => void
  connectedAddress: string | null
}

export const MyPortfolio: React.FC<MyPortfolioProps> = ({
  parcels,
  onListForSale,
  onDelistLand,
  onTransferOwnership,
  onDeleteLand,
  onOpenAuditTrail,
  connectedAddress,
}) => {
  const [listingParcelId, setListingParcelId] = useState<string | null>(null)
  const [listPriceAlgos, setListPriceAlgos] = useState('')

  const [transferParcelId, setTransferParcelId] = useState<string | null>(null)
  const [recipientAddress, setRecipientAddress] = useState('')

  const [viewingParcel, setViewingParcel] = useState<LandParcel | null>(null)

  const myParcels = connectedAddress
    ? parcels.filter((p) => p.owner.toLowerCase() === connectedAddress.toLowerCase())
    : parcels.slice(0, 3)

  const handleListSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!listingParcelId || !listPriceAlgos || Number(listPriceAlgos) <= 0) return
    const target = parcels.find((p) => p.parcelId === listingParcelId)
    if (target && target.status !== 'VERIFIED') {
      alert('ERROR: Ownership transfer / marketplace listing is allowed only for VERIFIED land records.')
      return
    }
    onListForSale(listingParcelId, Number(listPriceAlgos))
    setListingParcelId(null)
    setListPriceAlgos('')
  }

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferParcelId || !recipientAddress || recipientAddress.trim().length < 10) return
    const target = parcels.find((p) => p.parcelId === transferParcelId)
    if (target && target.status !== 'VERIFIED') {
      alert('ERROR: Ownership transfer is allowed only for VERIFIED land records.')
      return
    }
    onTransferOwnership(transferParcelId, recipientAddress.trim())
    setTransferParcelId(null)
    setRecipientAddress('')
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 lg:p-8 rounded-3xl border border-earth-600/15 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-earth-600/10 text-earth-700 border border-earth-600/15">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-stone-800">Landowner Portfolio Dashboard</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-earth-600/10 text-earth-700 border border-earth-600/15 text-xs font-semibold">
                  Personal Holdings
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">Manage your certified real-estate holdings, track verification status, issue sale listings, or transfer ownership on Algorand.</p>
            </div>
          </div>

          <div className="bg-stone-100 px-4 py-2 rounded-xl border border-stone-200 text-xs font-mono text-stone-500">
            <span className="text-stone-400">Connected Wallet:</span>{' '}
            <span className="text-earth-600 font-semibold">{connectedAddress ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}` : 'Demo Landowner'}</span>
          </div>
        </div>
      </div>

      {/* Holdings List */}
      {myParcels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myParcels.map((parcel) => (
            <div key={parcel.parcelId} className="glass-card p-6 rounded-3xl border border-stone-200 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <span className="font-mono text-xl font-bold text-stone-800 block">{parcel.parcelId}</span>
                    <span className="text-xs text-earth-600 font-semibold">{parcel.propertyType}</span>
                  </div>

                  {/* STATUS BADGES: PENDING (Yellow), VERIFIED (Green), REJECTED (Red) */}
                  {parcel.status === 'PENDING' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1">
                      🟡 PENDING
                    </span>
                  )}
                  {parcel.status === 'VERIFIED' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                      🟢 VERIFIED
                    </span>
                  )}
                  {parcel.status === 'REJECTED' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                      🔴 REJECTED
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-earth-500 shrink-0" />
                  {parcel.location}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Survey Number</span>
                    <span className="font-mono font-bold text-amber-700">{parcel.surveyNumber || `SURVEY-${parcel.parcelId}`}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Plot Area</span>
                    <span className="font-mono font-bold text-stone-700">{parcel.areaSqft.toLocaleString()} sq.ft</span>
                  </div>
                </div>

                {parcel.status === 'REJECTED' && parcel.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs space-y-1">
                    <span className="font-bold text-rose-600 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Rejection Reason:
                    </span>
                    <p className="text-[11px]">{parcel.rejectionReason}</p>
                  </div>
                )}

                <div>
                  <span className="text-[11px] text-stone-400 block mb-1">IPFS Document Hash</span>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-earth-600">
                    <span className="truncate max-w-[180px]">{parcel.documentHash}</span>
                    <button
                      onClick={() => setViewingParcel(parcel)}
                      className="text-earth-600 hover:text-earth-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer font-sans bg-earth-600/10 px-2 py-1 rounded border border-earth-600/15"
                    >
                      <Eye className="w-3 h-3" /> View Doc
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                {parcel.status === 'VERIFIED' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {parcel.isForSale ? (
                      <button
                        onClick={() => onDelistLand(parcel.parcelId)}
                        className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-amber-600 text-xs font-semibold border border-stone-200 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Tag className="w-3.5 h-3.5" /> Delist Sale
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setListingParcelId(parcel.parcelId)
                          setTransferParcelId(null)
                        }}
                        className="py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-semibold border border-amber-200 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Tag className="w-3.5 h-3.5" /> List for Sale
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setTransferParcelId(parcel.parcelId)
                        setListingParcelId(null)
                      }}
                      className="py-2.5 rounded-xl bg-earth-600/10 hover:bg-earth-600/15 text-earth-700 text-xs font-semibold border border-earth-600/15 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Transfer Title
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-400 text-center font-semibold">
                    🔒 Transfers & Listings disabled until Registrar VERIFIED
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenAuditTrail(parcel.parcelId)}
                    className="py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-medium border border-stone-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5 text-earth-500" /> Audit Trail
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete and deregister parcel '${parcel.parcelId}' from Box Storage?`)) {
                        onDeleteLand(parcel.parcelId)
                      }
                    }}
                    className="py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 text-xs font-semibold border border-rose-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Record
                  </button>
                </div>
              </div>

              {/* Inline List Modal */}
              {listingParcelId === parcel.parcelId && (
                <form onSubmit={handleListSubmit} className="p-4 bg-stone-50 rounded-2xl border border-amber-200 space-y-3">
                  <span className="text-xs font-bold text-amber-700 block">List Land Parcel on Marketplace</span>
                  <input
                    type="number"
                    required
                    step="0.001"
                    placeholder="Enter Price in ALGO (e.g. 10.0)"
                    value={listPriceAlgos}
                    onChange={(e) => setListPriceAlgos(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-stone-700 placeholder-stone-400"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setListingParcelId(null)} className="flex-1 py-1.5 rounded-lg bg-stone-200 text-stone-500 text-xs">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs">
                      Confirm Listing
                    </button>
                  </div>
                </form>
              )}

              {/* Inline Transfer Modal */}
              {transferParcelId === parcel.parcelId && (
                <form onSubmit={handleTransferSubmit} className="p-4 bg-stone-50 rounded-2xl border border-earth-600/20 space-y-3">
                  <span className="text-xs font-bold text-earth-700 block">Transfer Title Ownership</span>
                  <input
                    type="text"
                    required
                    placeholder="Enter Recipient 58-char Algorand Address..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-stone-700 font-mono text-[11px] placeholder-stone-400"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setTransferParcelId(null)} className="flex-1 py-1.5 rounded-lg bg-stone-200 text-stone-500 text-xs">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 py-1.5 rounded-lg bg-earth-600 hover:bg-earth-500 text-white font-bold text-xs">
                      Execute Transfer
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-3xl border border-stone-200">
          <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-700">No Holdings Found</h3>
          <p className="text-xs text-stone-400 mt-1">You currently do not own any registered land title records on Algorand.</p>
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal parcel={viewingParcel} onClose={() => setViewingParcel(null)} />
    </div>
  )
}
