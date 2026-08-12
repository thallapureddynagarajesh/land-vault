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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Initial Deed Issued</span>
      case 'GOV_APPROVAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Gov Authenticated</span>
      case 'LISTED_FOR_SALE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Listed on Marketplace</span>
      case 'PURCHASE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Atomic Purchase</span>
      case 'OWNERSHIP_TRANSFER':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">Direct Title Transfer</span>
      case 'DELISTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">Delisted from Sale</span>
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-2xl rounded-3xl border border-emerald-500/30 overflow-hidden shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Immutable Title Provenance & Audit Log
              </h3>
              <p className="text-xs text-slate-400 font-mono">Parcel Identification Number: <span className="text-emerald-400 font-bold">{parcel.parcelId}</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Current Titleholder</span>
              <span className="font-mono text-emerald-300 font-semibold truncate block">
                {parcel.owner.slice(0, 6)}...{parcel.owner.slice(-6)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Geo-Location</span>
              <span className="text-slate-200 font-medium truncate block">{parcel.location}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Area</span>
              <span className="font-mono text-white font-bold">{parcel.areaSqft.toLocaleString()} sq.ft</span>
            </div>
          </div>

          {/* Timeline Events */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Chronological Blockchain State Transitions ({parcelEvents.length})
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {parcelEvents.map((event) => (
                <div key={event.id} className="relative bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="absolute -left-[21px] top-4 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-sm" />

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {getEventBadge(event.eventType)}
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(event.timestamp * 1000).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    {event.fromAddress && (
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-slate-500">From:</span>
                        <span className="text-slate-300">{event.fromAddress.slice(0, 6)}...{event.fromAddress.slice(-4)}</span>
                        {event.toAddress && <ArrowRight className="w-3 h-3 text-emerald-400" />}
                        {event.toAddress && <span className="text-slate-300">{event.toAddress.slice(0, 6)}...{event.toAddress.slice(-4)}</span>}
                      </div>
                    )}

                    {event.priceAlgos !== undefined && (
                      <p className="text-xs font-mono text-amber-300">
                        Transaction Value: <span className="font-bold text-white">{event.priceAlgos} ALGO</span>
                      </p>
                    )}
                  </div>

                  {/* Transaction Hash & Block Round */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                    <span>Block Round: #{event.blockRound}</span>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Tx:</span>
                      <span className="text-cyan-400">{event.txHash.slice(0, 8)}...</span>
                      <button
                        onClick={() => handleCopy(event.txHash)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title="Copy Tx Hash"
                      >
                        {copiedTx === event.txHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <a
                        href={`https://testnet.explorer.perawallet.app/tx/${event.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-emerald-400"
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
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 text-center shrink-0">
          <p className="text-[11px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Tamper-Proof Record Verified on Algorand Blockchain
          </p>
        </div>
      </div>
    </div>
  )
}
