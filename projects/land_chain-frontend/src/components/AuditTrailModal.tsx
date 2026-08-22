import React, { useState } from 'react'
import { X, History, ExternalLink, ShieldCheck, CheckCircle2, Clock, ArrowRight, Copy, Check } from 'lucide-react'
import { AuditEvent, LandParcel } from '../interfaces/land'

interface AuditTrailModalProps {
  parcel: LandParcel | null
  auditEvents: AuditEvent[]
  onClose: () => void
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ parcel, auditEvents, onClose }) => {
  const [copiedTx, setCopiedTx] = useState<string | null>(null)

  if (!parcel) return null

  // Filter events for this parcel
  const parcelEvents = auditEvents.filter((e) => e.parcelId === parcel.parcelId)

  const handleCopy = (txHash: string) => {
    navigator.clipboard.writeText(txHash)
    setCopiedTx(txHash)
    setTimeout(() => setCopiedTx(null), 2000)
  }

  const getEventBadge = (type: AuditEvent['eventType']) => {
    switch (type) {
      case 'REGISTRATION':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-earth-600/10 text-earth-700 border border-earth-600/15">Initial Deed Issued</span>
      case 'GOV_APPROVAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">Gov Authenticated</span>
      case 'LISTED_FOR_SALE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">Listed on Marketplace</span>
      case 'PURCHASE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-200">Atomic Purchase</span>
      case 'OWNERSHIP_TRANSFER':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-earth-600/10 text-earth-700 border border-earth-600/15">Direct Title Transfer</span>
      case 'DELISTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-500 border border-stone-200">Delisted from Sale</span>
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md">
      <div className="glass-card w-full max-w-2xl rounded-3xl border border-earth-600/20 overflow-hidden shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-earth-600/10 text-earth-600 border border-earth-600/15">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                Immutable Title Provenance & Audit Log
              </h3>
              <p className="text-xs text-stone-400 font-mono">Parcel Identification Number: <span className="text-earth-600 font-bold">{parcel.parcelId}</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-400 block">Current Titleholder</span>
              <span className="font-mono text-earth-600 font-semibold truncate block">
                {parcel.owner.slice(0, 6)}...{parcel.owner.slice(-6)}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block">Geo-Location</span>
              <span className="text-stone-700 font-medium truncate block">{parcel.location}</span>
            </div>
            <div>
              <span className="text-stone-400 block">Total Area</span>
              <span className="font-mono text-stone-800 font-bold">{parcel.areaSqft.toLocaleString()} sq.ft</span>
            </div>
          </div>

          {/* Timeline Events */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-earth-500" /> Chronological Blockchain State Transitions ({parcelEvents.length})
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
              {parcelEvents.map((event) => (
                <div key={event.id} className="relative bg-white p-4 rounded-2xl border border-stone-200 space-y-2 shadow-sm">
                  <div className="absolute -left-[21px] top-4 w-3 h-3 rounded-full bg-earth-500 border-2 border-white shadow-sm" />

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {getEventBadge(event.eventType)}
                    <span className="text-[11px] font-mono text-stone-400">
                      {new Date(event.timestamp * 1000).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 space-y-1">
                    {event.fromAddress && (
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-stone-400">From:</span>
                        <span className="text-stone-600">{event.fromAddress.slice(0, 6)}...{event.fromAddress.slice(-4)}</span>
                        {event.toAddress && <ArrowRight className="w-3 h-3 text-earth-500" />}
                        {event.toAddress && <span className="text-stone-600">{event.toAddress.slice(0, 6)}...{event.toAddress.slice(-4)}</span>}
                      </div>
                    )}

                    {event.priceAlgos !== undefined && (
                      <p className="text-xs font-mono text-amber-600">
                        Transaction Value: <span className="font-bold text-stone-800">{event.priceAlgos} ALGO</span>
                      </p>
                    )}
                  </div>

                  {/* Transaction Hash & Block Round */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] font-mono text-stone-400">
                    <span>Block Round: #{event.blockRound}</span>

                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">Tx:</span>
                      <span className="text-earth-600">{event.txHash.slice(0, 8)}...</span>
                      <button
                        onClick={() => handleCopy(event.txHash)}
                        className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700"
                        title="Copy Tx Hash"
                      >
                        {copiedTx === event.txHash ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <a
                        href={`https://testnet.explorer.perawallet.app/tx/${event.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-stone-400 hover:text-earth-600"
                        title="View on Explorer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/80 text-center shrink-0">
          <p className="text-[11px] text-stone-400 font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-earth-500" /> Tamper-Proof Record Verified on Algorand Blockchain
          </p>
        </div>
      </div>
    </div>
  )
}
