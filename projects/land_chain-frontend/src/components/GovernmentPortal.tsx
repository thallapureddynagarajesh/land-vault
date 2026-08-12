import React, { useState } from 'react'
import { Landmark, PlusCircle, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, FileCode2, User, Hash, FileCheck, Layers } from 'lucide-react'
import { LandParcel } from '../interfaces/land'

interface GovernmentPortalProps {
  parcels: LandParcel[]
  onRegisterLand: (newParcel: Omit<LandParcel, 'isApproved' | 'isForSale' | 'priceMicroAlgos' | 'createdAt' | 'lastTransferAt'>) => void
  onApproveLand: (parcelId: string) => void
  connectedAddress: string | null
}

export const GovernmentPortal: React.FC<GovernmentPortalProps> = ({
  parcels,
  onRegisterLand,
  onApproveLand,
  connectedAddress,
}) => {
  const [parcelId, setParcelId] = useState('')
  const [location, setLocation] = useState('')
  const [areaSqft, setAreaSqft] = useState('')
  const [propertyType, setPropertyType] = useState<'Residential' | 'Commercial' | 'Agricultural' | 'Industrial'>('Residential')
  const [documentType, setDocumentType] = useState('Sale Deed')
  const [ipfsCid, setIpfsCid] = useState('')
  const [owner, setOwner] = useState('')
  const [documentHash, setDocumentHash] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const pendingParcels = parcels.filter((p) => !p.isApproved)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!parcelId || !location || !areaSqft || !owner || !documentHash) return

    setIsSubmitting(true)
    setTimeout(() => {
      onRegisterLand({
        parcelId: parcelId.trim().toUpperCase(),
        location: location.trim(),
        areaSqft: Number(areaSqft),
        propertyType,
        documentType: documentType || 'Sale Deed',
        owner: owner.trim(),
        ipfsCid: ipfsCid.trim() || `Qm${documentHash.trim().slice(0, 44)}`,
        documentHash: documentHash.trim(),
      })
      setIsSubmitting(false)
      setSuccessMsg(`Parcel ${parcelId.toUpperCase()} successfully issued & stored in Algorand Smart Contract!`)
      setParcelId('')
      setLocation('')
      setAreaSqft('')
      setOwner('')
      setIpfsCid('')
      setDocumentHash('')
      setTimeout(() => setSuccessMsg(''), 4000)
    }, 1000)
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 lg:p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Landmark className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">Government Land Registrar Portal</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                  Official Authority
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Issue official deeds, verify ownership claims, and enforce spatial planning standards.</p>
            </div>
          </div>

          <div className="bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-slate-500">Authority Address:</span>{' '}
            <span className="text-emerald-400 font-semibold">{connectedAddress ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}` : 'Government Admin Key'}</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Register New Land Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-extrabold text-white">Issue Official Land Parcel Deed</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">ARC-56 Box Write</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-400" /> Parcel Identification Number (PIN)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PRCL-2026-9901"
                    value={parcelId}
                    onChange={(e) => setParcelId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-400" /> Property Classification
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none bg-slate-900 cursor-pointer"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Agricultural">Agricultural</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Physical Location / Geo-Coordinates
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 14, Plot 88, Metro Financial District"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-indigo-400" /> Total Area (Square Feet)
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 3500"
                    value={areaSqft}
                    onChange={(e) => setAreaSqft(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" /> Initial Owner Algorand Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="58-character Algorand wallet address..."
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-amber-400" /> Title Deed Cryptographic Document Hash (SHA-256 / IPFS)
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                      value={documentHash}
                      onChange={(e) => setDocumentHash(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                    />
                    <label className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                      <span>📁 Select File to Hash</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const buffer = await file.arrayBuffer()
                          const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer)
                          const hashArray = Array.from(new Uint8Array(hashBuffer))
                          const sha256Hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
                          setDocumentHash(sha256Hex)
                        }}
                      />
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Upload a physical/digital deed file above to auto-generate its SHA-256 hash, or paste an IPFS CID hash.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-emerald-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Signing & Writing to Algorand Box Storage...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Issue & Seal Land Deed On-Chain
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Pending Registrations Queue */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Pending Approval Queue ({pendingParcels.length})
              </h3>
              <span className="text-[11px] text-slate-400">Gov Validation</span>
            </div>

            {pendingParcels.length > 0 ? (
              <div className="space-y-3">
                {pendingParcels.map((parcel) => (
                  <div key={parcel.parcelId} className="bg-slate-900/80 p-4 rounded-2xl border border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-white">{parcel.parcelId}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Needs Verification
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {parcel.location}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-mono">{parcel.areaSqft} sq.ft</span>
                      <button
                        onClick={() => onApproveLand(parcel.parcelId)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Title
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-white">All land titles verified!</p>
                <p className="text-[11px] text-slate-400 mt-1">There are currently no unapproved land title deeds in the government queue.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
