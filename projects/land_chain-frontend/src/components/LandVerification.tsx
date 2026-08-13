import React, { useState } from 'react'
import { Search, ShieldCheck, CheckCircle2, FileText, MapPin, ExternalLink, Calendar, History, QrCode, AlertCircle, Copy, Check, UploadCloud, FileCheck2, AlertTriangle, RefreshCw } from 'lucide-react'
import { LandParcel } from '../interfaces/land'
import { LandRecordDetails } from './LandRecordDetails'
import { processX402StoragePayment } from '../services/x402Gateway'

interface LandVerificationProps {
  parcels: LandParcel[]
  onOpenAuditTrail: (parcelId: string) => void
  onRegisterLand?: (newParcel: Omit<LandParcel, 'isApproved' | 'isForSale' | 'priceMicroAlgos' | 'createdAt' | 'lastTransferAt'>) => void
  connectedAddress?: string | null
  userRole?: 'citizen' | 'registrar' | 'investor'
}

export const LandVerification: React.FC<LandVerificationProps> = ({
  parcels,
  onOpenAuditTrail,
  onRegisterLand,
  connectedAddress,
  userRole = 'citizen',
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(parcels[0] || null)
  const [copiedHash, setCopiedHash] = useState(false)

  // Document verification file upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [computedHash, setComputedHash] = useState<string | null>(null)
  const [isVerifyingFile, setIsVerifyingFile] = useState(false)
  const [fileVerificationStatus, setFileVerificationStatus] = useState<'MATCH' | 'MISMATCH' | null>(null)
  const [matchedParcel, setMatchedParcel] = useState<LandParcel | null>(null)

  // Store Document into Ledger modal state
  const [showStoreModal, setShowStoreModal] = useState(false)
  const [storePin, setStorePin] = useState('')
  const [storeLocation, setStoreLocation] = useState('')
  const [storeArea, setStoreArea] = useState('')
  const [storeOwner, setStoreOwner] = useState('')
  const [storeDocHash, setStoreDocHash] = useState('')
  const [storeFileName, setStoreFileName] = useState('')
  const [isStoringDoc, setIsStoringDoc] = useState(false)

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storePin || !storeLocation || !storeArea || !storeOwner || !storeDocHash) return

    setIsStoringDoc(true)
    await processX402StoragePayment(storeOwner.trim(), storePin.trim().toUpperCase())

    if (onRegisterLand) {
      onRegisterLand({
        parcelId: storePin.trim().toUpperCase(),
        location: storeLocation.trim(),
        areaSqft: Number(storeArea),
        propertyType: 'Residential',
        documentType: 'Sale Deed',
        owner: storeOwner.trim(),
        ipfsCid: `Qm${storeDocHash.trim().slice(0, 44)}`,
        documentHash: storeDocHash.trim(),
      })
    }
    setIsStoringDoc(false)
    setShowStoreModal(false)

    const newP: LandParcel = {
      parcelId: storePin.trim().toUpperCase(),
      location: storeLocation.trim(),
      areaSqft: Number(storeArea),
      propertyType: 'Residential',
      documentType: 'Sale Deed',
      owner: storeOwner.trim(),
      isApproved: true,
      isForSale: false,
      priceMicroAlgos: 0,
      ipfsCid: `Qm${storeDocHash.trim().slice(0, 44)}`,
      documentHash: storeDocHash.trim(),
      createdAt: Math.floor(Date.now() / 1000),
      lastTransferAt: Math.floor(Date.now() / 1000),
    }
    setSelectedParcel(newP)
    setStorePin('')
    setStoreLocation('')
    setStoreArea('')
    setStoreOwner('')
    setStoreDocHash('')
    setStoreFileName('')
  }

  const [searchError, setSearchError] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError(null)
    if (!searchQuery.trim()) return

    const q = searchQuery.trim().toLowerCase()
    const match = parcels.find(
      (p) =>
        p.parcelId.toLowerCase() === q ||
        p.owner.toLowerCase() === q ||
        p.location.toLowerCase().includes(q)
    )

    if (match) {
      setSelectedParcel(match)
      setFileVerificationStatus(null)
      setSearchError(null)
    } else {
      setSearchError(`No land record found matching '${searchQuery}'. Try clicking one of the Quick Try parcel IDs below.`)
    }
  }

  // Cryptographic File Hash Calculator (SHA-256)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    setIsVerifyingFile(true)
    setFileVerificationStatus(null)

    try {
      const buffer = await file.arrayBuffer()
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const sha256Hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

      setComputedHash(sha256Hex)

      setTimeout(() => {
        const targetParcel = selectedParcel || parcels[0]
        const isMatch = targetParcel && targetParcel.documentHash.toLowerCase() === sha256Hex.toLowerCase()

        if (isMatch) {
          setFileVerificationStatus('MATCH')
          setMatchedParcel(targetParcel)
        } else {
          setFileVerificationStatus('MISMATCH')
          setMatchedParcel(targetParcel)
        }
        setIsVerifyingFile(false)
      }, 700)
    } catch (err) {
      console.error('File hashing error:', err)
      setIsVerifyingFile(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Search Header Banner */}
      <div className="glass-card p-8 rounded-3xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> Real-Time Title Authentication Engine
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verify Land Ownership & Document Integrity <span className="gradient-text-emerald">On Algorand</span>
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Query tamper-proof government land records stored permanently on-chain by Parcel ID, or upload a physical/digital deed PDF to test cryptographic hash verification against the ledger.
          </p>

          {/* Search Form & Store Trigger */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Parcel ID (e.g. PRCL-2026-8801 or Sector 14)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-white text-sm placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Verify Title
              </button>
            </form>

            <button
              onClick={() => setShowStoreModal(true)}
              className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-sm border border-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-md"
            >
              <UploadCloud className="w-4 h-4 text-amber-400" />
              Store Document in Ledger
            </button>
          </div>

          {searchError && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" /> {searchError}
              </span>
              <button
                onClick={() => setSearchError(null)}
                className="text-amber-400 hover:text-white font-bold text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Quick Try:</span>
            {parcels.slice(0, 4).map((p) => (
              <button
                key={p.parcelId}
                onClick={() => {
                  setSearchQuery(p.parcelId)
                  setSelectedParcel(p)
                  setFileVerificationStatus(null)
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-emerald-400 font-mono transition-colors cursor-pointer"
              >
                {p.parcelId}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Document File Drag & Drop Cryptographic Ledger Verifier Box */}
      <div className="glass-card p-6 lg:p-8 rounded-3xl border border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cryptographic Ledger Document Verification Tool</h3>
              <p className="text-xs text-slate-400">
                Test any uploaded title document against the permanent Algorand ledger record for <span className="text-emerald-400 font-mono font-bold">{selectedParcel?.parcelId || 'PRCL-2026-8801'}</span>.
              </p>
            </div>
          </div>

          {/* Quick sample test buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                const p = selectedParcel || parcels[0]
                setUploadedFileName(`deed_${p.parcelId}_AUTHENTIC.txt`)
                setComputedHash(p.documentHash)
                setFileVerificationStatus('MATCH')
                setMatchedParcel(p)
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5" /> ⚡ Test Authentic Match Against Ledger
            </button>

            <button
              type="button"
              onClick={() => {
                const p = selectedParcel || parcels[0]
                setUploadedFileName(`deed_${p.parcelId}_ALTERED_COPY.txt`)
                setComputedHash('f7c32e9184029148501294821094812049812049812049812049812049812049')
                setFileVerificationStatus('MISMATCH')
                setMatchedParcel(p)
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium transition-all cursor-pointer flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> 🚨 Test Document Mismatch Against Ledger
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* File Upload Trigger */}
          <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/50 hover:bg-slate-900 transition-all cursor-pointer text-center space-y-2">
            <UploadCloud className="w-10 h-10 text-emerald-400" />
            <div>
              <span className="text-xs font-semibold text-white block">Click or Drop Land Title Document Here</span>
              <span className="text-[11px] text-slate-400">Upload PDF, PNG, JPG, or TXT file to calculate SHA-256 & test against ledger</span>
            </div>
            <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.txt" />
          </label>

          {/* Verification Status Result */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            {isVerifyingFile ? (
              <div className="py-6 text-center space-y-2">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-white">Computing Cryptographic SHA-256 Hash & Comparing with Algorand Ledger...</p>
              </div>
            ) : fileVerificationStatus === 'MATCH' && matchedParcel ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <FileCheck2 className="w-5 h-5" />
                  <span>✅ DOCUMENT MATCHES LEDGER RECORD PERFECTLY</span>
                </div>

                <div className="space-y-1.5 text-xs font-mono bg-slate-900/90 p-3 rounded-xl border border-emerald-500/20">
                  <p className="text-slate-400">
                    File: <span className="text-white">{uploadedFileName}</span>
                  </p>
                  <p className="text-slate-400 truncate">
                    Uploaded File SHA-256: <span className="text-cyan-300">{computedHash}</span>
                  </p>
                  <p className="text-slate-400 truncate">
                    On-Chain Ledger Hash: <span className="text-emerald-300 font-bold">{matchedParcel.documentHash}</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                  ✔ <strong>100% Cryptographic Match Confirmed.</strong> The uploaded document is identical to the official deed recorded in Algorand Box Storage for <strong>{matchedParcel.parcelId}</strong>.
                </div>
              </div>
            ) : fileVerificationStatus === 'MISMATCH' && matchedParcel ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>🚨 DOCUMENT MISMATCH DETECTED (ALTERED FILE)</span>
                </div>

                <div className="space-y-2 text-xs font-mono bg-slate-900/90 p-3 rounded-xl border border-rose-500/30">
                  <p className="text-slate-400">
                    File Tested: <span className="text-rose-300 font-semibold">{uploadedFileName}</span>
                  </p>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Uploaded Document Computed SHA-256 Hash:</span>
                    <span className="text-rose-400 font-bold break-all">{computedHash}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Official Algorand On-Chain Sealed Hash:</span>
                    <span className="text-emerald-400 font-bold break-all">{matchedParcel.documentHash}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
                  ✖ <strong>SECURITY WARNING:</strong> The SHA-256 cryptographic hash of this document does NOT match the sealed ledger hash for <strong>{matchedParcel.parcelId}</strong>. The document has been modified, tampered with, or is counterfeit!
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-400 space-y-1">
                <FileText className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-medium text-slate-300">No document tested yet</p>
                <p className="text-[11px] text-slate-500">Upload a title deed document or click the test buttons above to compare against the ledger.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title Deed Verification Certificate Card */}
      {selectedParcel ? (
        <LandRecordDetails
          parcel={selectedParcel}
          onOpenAuditTrail={onOpenAuditTrail}
          connectedAddress={connectedAddress}
          userRole={userRole}
        />
      ) : (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-500" />
          <p className="text-base font-semibold text-white">No land parcel selected</p>
          <p className="text-xs text-slate-400 mt-1">Use the search bar above to look up any parcel ID or property address.</p>
        </div>
      )}

      {/* Store Document into Ledger Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl space-y-6">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Store Document in Algorand Ledger</h3>
                  <p className="text-xs text-slate-400">Mint & seal a new title deed document into smart contract box storage.</p>
                </div>
              </div>
              <button onClick={() => setShowStoreModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleStoreSubmit} className="p-6 space-y-4 pt-0">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Parcel Identification Number (PIN)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PRCL-2026-5509"
                    value={storePin}
                    onChange={(e) => setStorePin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Physical Location / Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot 12, Ocean View Boulevard"
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs placeholder-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Area (Square Feet)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 4200"
                      value={storeArea}
                      onChange={(e) => setStoreArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs placeholder-slate-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Owner Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Algorand wallet address..."
                      value={storeOwner}
                      onChange={(e) => setStoreOwner(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs placeholder-slate-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Upload Document File to Compute Ledger Hash</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Computed SHA-256 Hash..."
                      value={storeDocHash}
                      onChange={(e) => setStoreDocHash(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-white text-xs placeholder-slate-500 font-mono"
                    />
                    <label className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 cursor-pointer whitespace-nowrap flex items-center gap-1">
                      <span>📁 Select File</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setStoreFileName(file.name)
                          const buffer = await file.arrayBuffer()
                          const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer)
                          const hashArray = Array.from(new Uint8Array(hashBuffer))
                          const sha256Hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
                          setStoreDocHash(sha256Hex)
                        }}
                      />
                    </label>
                  </div>
                  {storeFileName && <span className="text-[11px] text-emerald-400 font-mono block mt-1">Hashed File: {storeFileName}</span>}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isStoringDoc}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isStoringDoc ? 'Processing 0.1 ALGO x402 Fee & Sealing Document...' : '💳 Authorize 0.1 ALGO (x402 Fee) & Store Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
