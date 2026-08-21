import React, { useState } from 'react'
import { Landmark, PlusCircle, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, FileCode2, User, Hash, FileCheck, Layers, ExternalLink, XCircle, Check, X, FileText } from 'lucide-react'
import { LandParcel } from '../interfaces/land'
import { getIPFSGatewayUrl } from '../services/ipfs'

interface GovernmentPortalProps {
  parcels: LandParcel[]
  onRegisterLand: (newParcel: Omit<LandParcel, 'isApproved' | 'isForSale' | 'priceMicroAlgos' | 'createdAt' | 'lastTransferAt'>) => void
  onApproveLand: (parcelId: string) => void
  onRejectLand?: (parcelId: string, reason: string) => void
  connectedAddress: string | null
}

export const GovernmentPortal: React.FC<GovernmentPortalProps> = ({
  parcels,
  onRegisterLand,
  onApproveLand,
  onRejectLand,
  connectedAddress,
}) => {
  // Direct Registration Form State
  const [parcelId, setParcelId] = useState('')
  const [surveyNumber, setSurveyNumber] = useState('')
  const [location, setLocation] = useState('')
  const [areaSqft, setAreaSqft] = useState('')
  const [propertyType, setPropertyType] = useState<'Residential' | 'Commercial' | 'Agricultural' | 'Industrial'>('Residential')
  const [documentType, setDocumentType] = useState('Sale Deed')
  const [ipfsCid, setIpfsCid] = useState('')
  const [owner, setOwner] = useState('')
  const [documentHash, setDocumentHash] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Modals for Approve / Reject
  const [approvingParcel, setApprovingParcel] = useState<LandParcel | null>(null)
  const [rejectingParcel, setRejectingParcel] = useState<LandParcel | null>(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)

  // Filter pending review queue
  const pendingParcels = parcels.filter((p) => p.status === 'PENDING' || (!p.isApproved && p.status !== 'REJECTED'))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!parcelId || !location || !areaSqft || !owner || !documentHash) return

    setIsSubmitting(true)
    setTimeout(() => {
      onRegisterLand({
        parcelId: parcelId.trim().toUpperCase(),
        surveyNumber: surveyNumber.trim() ? surveyNumber.trim().toUpperCase() : `SURVEY-${parcelId.trim().toUpperCase()}`,
        location: location.trim(),
        areaSqft: Number(areaSqft),
        propertyType,
        documentType: documentType || 'Sale Deed',
        owner: owner.trim(),
        ipfsCid: ipfsCid.trim() || `Qm${documentHash.trim().slice(0, 44)}`,
        documentHash: documentHash.trim(),
        status: 'PENDING',
      })
      setIsSubmitting(false)
      setSuccessMsg(`Parcel ${parcelId.toUpperCase()} submitted for Registrar Review! Status: PENDING`)
      setParcelId('')
      setSurveyNumber('')
      setLocation('')
      setAreaSqft('')
      setOwner('')
      setIpfsCid('')
      setDocumentHash('')
      setTimeout(() => setSuccessMsg(''), 4000)
    }, 800)
  }

  const handleConfirmApproval = () => {
    if (!approvingParcel) return
    onApproveLand(approvingParcel.parcelId)
    setApprovingParcel(null)
  }

  const handleConfirmRejection = () => {
    if (!rejectingParcel) return
    if (!rejectionReasonInput.trim()) {
      setReasonError('Please enter a valid rejection reason for the landowner.')
      return
    }
    if (onRejectLand) {
      onRejectLand(rejectingParcel.parcelId, rejectionReasonInput.trim())
    }
    setRejectingParcel(null)
    setRejectionReasonInput('')
    setReasonError(null)
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
                <h2 className="text-2xl font-bold text-white">Government Registrar Authority Portal</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                  Authorized Registrar
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Review pending land title registrations, inspect IPFS deed CIDs, and approve or reject submissions on Algorand.</p>
            </div>
          </div>

          <div className="bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-slate-500">Registrar Address:</span>{' '}
            <span className="text-emerald-400 font-semibold">{connectedAddress ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}` : 'Registrar Key'}</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pending Verification Requests (Main Registrar Task Queue) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 lg:p-8 rounded-3xl border border-amber-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-extrabold text-white">Pending Verification Requests ({pendingParcels.length})</h3>
              </div>
              <span className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-semibold">
                Action Required
              </span>
            </div>

            {pendingParcels.length > 0 ? (
              <div className="space-y-4">
                {pendingParcels.map((parcel) => (
                  <div key={parcel.parcelId} className="bg-slate-950/80 p-5 rounded-2xl border border-amber-500/20 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="font-mono text-base font-extrabold text-white">{parcel.parcelId}</span>
                        <span className="ml-2 font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {parcel.surveyNumber || `SURVEY-${parcel.parcelId}`}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                        ⏳ PENDING VERIFICATION
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Location</span>
                        <span className="font-semibold text-white flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {parcel.location}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Plot Area</span>
                        <span className="font-mono font-semibold text-white">{parcel.areaSqft.toLocaleString()} sq. ft</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Applicant Owner</span>
                        <span className="font-mono text-[11px] text-slate-300 truncate block">
                          {parcel.owner.slice(0, 10)}...{parcel.owner.slice(-6)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Document Type</span>
                        <span className="font-semibold text-teal-400">{parcel.documentType}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800 gap-2">
                      <a
                        href={getIPFSGatewayUrl(parcel.ipfsCid)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> VIEW DOCUMENT
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setRejectingParcel(parcel)
                            setRejectionReasonInput('')
                            setReasonError(null)
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400" /> REJECT
                        </button>

                        <button
                          onClick={() => setApprovingParcel(parcel)}
                          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> APPROVE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-90" />
                <h4 className="text-sm font-bold text-white">All Pending Submissions Clear!</h4>
                <p className="text-xs text-slate-400 mt-1">There are currently no land title requests waiting for registrar review.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Direct Registrar Issuance Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-extrabold text-white">Direct Registrar Title Issuance</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">ARC-56 Box Write</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Parcel ID (PIN)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRCL-2026-9901"
                  value={parcelId}
                  onChange={(e) => setParcelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono placeholder-slate-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Survey Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SURVEY-123/4A"
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono placeholder-slate-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Location Address</label>
                <input
                  type="text"
                  required
                  placeholder="Sector 14, Plot 88"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Plot Area (sq.ft)</label>
                  <input
                    type="number"
                    required
                    placeholder="3500"
                    value={areaSqft}
                    onChange={(e) => setAreaSqft(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Owner Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Algorand address..."
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Document Cryptographic Hash</label>
                <input
                  type="text"
                  required
                  placeholder="SHA-256 hash or IPFS CID..."
                  value={documentHash}
                  onChange={(e) => setDocumentHash(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" /> Issue Title Deed (Submit PENDING)
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* APPROVAL CONFIRMATION MODAL */}
      {approvingParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-emerald-500/40 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Confirm Registrar Approval
              </h3>
              <button onClick={() => setApprovingParcel(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="text-sm font-semibold text-white">
                Are you sure you want to approve land record <strong className="font-mono text-emerald-400">{approvingParcel.parcelId}</strong>?
              </p>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                <div>Survey Number: <span className="text-amber-300">{approvingParcel.surveyNumber}</span></div>
                <div>Location: <span className="text-white">{approvingParcel.location}</span></div>
                <div>Owner: <span className="text-cyan-300">{approvingParcel.owner.slice(0, 10)}...</span></div>
              </div>
              <p className="text-emerald-400 text-[11px] bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                ✔ This action will officially mark the land record as <strong>VERIFIED</strong> on the Algorand blockchain and enable marketplace transfer.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setApprovingParcel(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" /> Yes, Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-rose-500/40 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" /> Reject Land Registration
              </h3>
              <button onClick={() => setRejectingParcel(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Rejecting parcel <strong className="font-mono text-white">{rejectingParcel.parcelId}</strong> ({rejectingParcel.surveyNumber}).
              </p>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Mandatory Rejection Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Mismatched boundary survey map. Please re-upload certified land survey deed..."
                  value={rejectionReasonInput}
                  onChange={(e) => {
                    setRejectionReasonInput(e.target.value)
                    setReasonError(null)
                  }}
                  className="w-full p-3 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                {reasonError && <span className="text-[11px] text-rose-400 font-semibold block mt-1">{reasonError}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRejectingParcel(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20"
              >
                <XCircle className="w-4 h-4" /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
