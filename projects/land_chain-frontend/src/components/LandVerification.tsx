import React, { useState } from 'react'
import { Search, ShieldCheck, CheckCircle2, FileText, MapPin, ExternalLink, Calendar, History, QrCode, AlertCircle, Copy, Check, UploadCloud, FileCheck2, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { LandParcel } from '../interfaces/land'
import { LandRecordDetails } from './LandRecordDetails'
import { processX402StoragePayment } from '../services/x402Gateway'

interface LandVerificationProps {
  parcels: LandParcel[]
  onOpenAuditTrail: (parcelId: string) => void
  onRegisterLand?: (newParcel: Omit<LandParcel, 'isApproved' | 'isForSale' | 'priceMicroAlgos' | 'createdAt' | 'lastTransferAt'>) => void
  onDeleteLand?: (parcelId: string) => void
  connectedAddress?: string | null
  userRole?: 'citizen' | 'registrar' | 'investor'
  onConnectWalletClick?: () => void
  externalSearchQuery?: string
}

export const LandVerification: React.FC<LandVerificationProps> = ({
  parcels,
  onOpenAuditTrail,
  onRegisterLand,
  onDeleteLand,
  connectedAddress,
  userRole = 'citizen',
  onConnectWalletClick,
  externalSearchQuery = '',
}) => {
  const { activeAddress, activeWallet, transactionSigner } = useWallet()

  const [searchQuery, setSearchQuery] = useState(externalSearchQuery)
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(parcels[0] || null)

  React.useEffect(() => {
    if (externalSearchQuery) {
      setSearchQuery(externalSearchQuery)
      const q = externalSearchQuery.trim().toLowerCase()
      const match = parcels.find(
        (p) =>
          p.parcelId.toLowerCase() === q ||
          (p.surveyNumber && p.surveyNumber.toLowerCase() === q) ||
          p.owner.toLowerCase() === q ||
          p.location.toLowerCase().includes(q)
      )
      if (match) {
        setSelectedParcel(match)
      }
    }
  }, [externalSearchQuery, parcels])
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

  // Delete Document from Ledger modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteParcelInput, setDeleteParcelInput] = useState('')
  const [isDeletingDoc, setIsDeletingDoc] = useState(false)

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deleteParcelInput.trim()) return

    const parcelIdToDelete = deleteParcelInput.trim().toUpperCase()
    const target = parcels.find((p) => p.parcelId.toUpperCase() === parcelIdToDelete)

    if (!target) {
      alert(`⚠️ Parcel ID '${parcelIdToDelete}' was not found in the ledger database.`)
      return
    }

    if (window.confirm(`Are you sure you want to delete and deregister parcel '${parcelIdToDelete}' from Algorand Box Storage?`)) {
      if (onDeleteLand) {
        setIsDeletingDoc(true)
        onDeleteLand(parcelIdToDelete)
        setIsDeletingDoc(false)
        setShowDeleteModal(false)
        setDeleteParcelInput('')
        if (selectedParcel?.parcelId.toUpperCase() === parcelIdToDelete) {
          setSelectedParcel(null)
        }
        alert(`✅ Parcel '${parcelIdToDelete}' has been successfully deleted and deregistered from Algorand Box Storage.`)
      }
    }
  }

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storePin || !storeLocation || !storeArea || !storeOwner || !storeDocHash) return

    const payerAddressToUse = connectedAddress || activeAddress || storeOwner.trim()

    if (!transactionSigner && !activeWallet) {
      if (onConnectWalletClick) onConnectWalletClick()
      alert('⚠️ Algorand Wallet Connection Required: Please select Pera Wallet in the Connect Wallet popup to authorize and pay the 0.005 ALGO x402 storage fee.')
      return
    }

    try {
      setIsStoringDoc(true)
      const walletOrSigner = transactionSigner || activeWallet
      await processX402StoragePayment(payerAddressToUse, storePin.trim().toUpperCase(), walletOrSigner)

      if (onRegisterLand) {
        onRegisterLand({
          parcelId: storePin.trim().toUpperCase(),
          surveyNumber: `SURVEY-${storePin.trim().toUpperCase()}`,
          location: storeLocation.trim(),
          areaSqft: Number(storeArea),
          propertyType: 'Residential',
          documentType: 'Sale Deed',
          owner: storeOwner.trim(),
          ipfsCid: `Qm${storeDocHash.trim().slice(0, 44)}`,
          documentHash: storeDocHash.trim(),
          status: 'PENDING',
        })
      }

      const newP: LandParcel = {
        parcelId: storePin.trim().toUpperCase(),
        surveyNumber: `SURVEY-${storePin.trim().toUpperCase()}`,
        location: storeLocation.trim(),
        areaSqft: Number(storeArea),
        propertyType: 'Residential',
        documentType: 'Sale Deed',
        owner: storeOwner.trim(),
        isApproved: false,
        isForSale: false,
        priceMicroAlgos: 0,
        ipfsCid: `Qm${storeDocHash.trim().slice(0, 44)}`,
        documentHash: storeDocHash.trim(),
        createdAt: Math.floor(Date.now() / 1000),
        lastTransferAt: Math.floor(Date.now() / 1000),
        status: 'PENDING',
      }
      setSelectedParcel(newP)

      setShowStoreModal(false)
      setStorePin('')
      setStoreLocation('')
      setStoreArea('')
      setStoreOwner('')
      setStoreDocHash('')
      setStoreFileName('')
    } catch (err: any) {
      alert(err.message || 'Payment or Storage error.')
    } finally {
      setIsStoringDoc(false)
    }
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
        (p.surveyNumber && p.surveyNumber.toLowerCase() === q) ||
        p.owner.toLowerCase() === q ||
        p.location.toLowerCase().includes(q)
    )

    if (match) {
      setSelectedParcel(match)
      setFileVerificationStatus(null)
      setSearchError(null)
    } else {
      setSearchError(`No land record found matching '${searchQuery}'. Try searching by Land ID or Survey Number.`)
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
      setFileVerificationStatus('MISMATCH')
      setIsVerifyingFile(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Search Header Banner */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden border border-stone-200/90 shadow-xs">
        <div className="max-w-2xl mx-auto text-center space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-earth-50 text-earth-700 border border-earth-200 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3" /> Real-Time Title Authentication Engine
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Verify Land Ownership & Title Integrity <span className="gradient-text-emerald">On Algorand</span>
          </h2>
          <p className="text-stone-500 text-xs max-w-lg mx-auto leading-relaxed">
            Query immutable land records stored in Algorand smart contract box storage or verify digital deeds with SHA-256 cryptographic proofs.
          </p>

          {/* Search Form & Action Triggers */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <form onSubmit={handleSearch} className="flex-1 flex gap-1.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search PIN (e.g. PRCL-2026-8801 or Sector 14)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-stone-800 text-xs placeholder-stone-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-earth-600 hover:bg-earth-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5" />
                Verify
              </button>
            </form>

            <button
              onClick={() => setShowStoreModal(true)}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
              Store in Ledger
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              Delete Record
            </button>
          </div>

          {searchError && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-center justify-between animate-in fade-in duration-200">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {searchError}
              </span>
              <button
                onClick={() => setSearchError(null)}
                className="text-amber-700 hover:text-amber-900 font-bold text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px] text-stone-400">
            <span className="font-semibold text-stone-400">Quick Try:</span>
            {parcels.slice(0, 4).map((p) => (
              <button
                key={p.parcelId}
                onClick={() => {
                  setSearchQuery(p.parcelId)
                  setSelectedParcel(p)
                  setFileVerificationStatus(null)
                }}
                className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-earth-700 font-mono text-[11px] transition-colors cursor-pointer"
              >
                {p.parcelId}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Document File Drag & Drop Cryptographic Ledger Verifier Box */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-stone-200/90 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-earth-600/10 text-earth-600 border border-earth-600/15">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">Cryptographic Ledger Document Verification Tool</h3>
              <p className="text-xs text-stone-400">
                Test any uploaded title document against the permanent Algorand ledger record for <span className="text-earth-600 font-mono font-bold">{selectedParcel?.parcelId || 'PRCL-2026-8801'}</span>.
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
              className="px-3 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-medium transition-all cursor-pointer flex items-center gap-1.5"
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
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-medium transition-all cursor-pointer flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> 🚨 Test Document Mismatch Against Ledger
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* File Upload Trigger */}
          <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-stone-300 hover:border-earth-600/50 bg-stone-50 hover:bg-white transition-all cursor-pointer text-center space-y-2">
            <UploadCloud className="w-10 h-10 text-earth-500" />
            <div>
              <span className="text-xs font-semibold text-stone-700 block">Click or Drop Land Title Document Here</span>
              <span className="text-[11px] text-stone-400">Upload PDF, PNG, JPG, or TXT file to calculate SHA-256 & test against ledger</span>
            </div>
            <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.txt" />
          </label>

          {/* Verification Status Result */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
            {isVerifyingFile ? (
              <div className="py-6 text-center space-y-2">
                <RefreshCw className="w-8 h-8 text-earth-500 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-stone-700">Computing Cryptographic SHA-256 Hash & Comparing with Algorand Ledger...</p>
              </div>
            ) : fileVerificationStatus === 'MATCH' && matchedParcel ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                  <FileCheck2 className="w-5 h-5" />
                  <span>✅ DOCUMENT MATCHES LEDGER RECORD PERFECTLY</span>
                </div>

                <div className="space-y-1.5 text-xs font-mono bg-white p-3 rounded-xl border border-green-200">
                  <p className="text-stone-400">
                    File: <span className="text-stone-700">{uploadedFileName}</span>
                  </p>
                  <p className="text-stone-400 truncate">
                    Uploaded File SHA-256: <span className="text-earth-600">{computedHash}</span>
                  </p>
                  <p className="text-stone-400 truncate">
                    On-Chain Ledger Hash: <span className="text-green-700 font-bold">{matchedParcel.documentHash}</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-green-50 border border-green-200 text-[11px] text-green-700">
                  ✔ <strong>100% Cryptographic Match Confirmed.</strong> The uploaded document is identical to the official deed recorded in Algorand Box Storage for <strong>{matchedParcel.parcelId}</strong>.
                </div>
              </div>
            ) : fileVerificationStatus === 'MISMATCH' && matchedParcel ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>🚨 DOCUMENT MISMATCH DETECTED (ALTERED FILE)</span>
                </div>

                <div className="space-y-2 text-xs font-mono bg-white p-3 rounded-xl border border-rose-200">
                  <p className="text-stone-400">
                    File Tested: <span className="text-rose-600 font-semibold">{uploadedFileName}</span>
                  </p>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Uploaded Document Computed SHA-256 Hash:</span>
                    <span className="text-rose-600 font-bold break-all">{computedHash}</span>
                  </div>
                  <div className="pt-1 border-t border-stone-200">
                    <span className="text-stone-400 block text-[10px]">Official Algorand On-Chain Sealed Hash:</span>
                    <span className="text-green-700 font-bold break-all">{matchedParcel.documentHash}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-600">
                  ✖ <strong>SECURITY WARNING:</strong> The SHA-256 cryptographic hash of this document does NOT match the sealed ledger hash for <strong>{matchedParcel.parcelId}</strong>. The document has been modified, tampered with, or is counterfeit!
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-stone-400 space-y-1">
                <FileText className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-xs font-medium text-stone-600">No document tested yet</p>
                <p className="text-[11px] text-stone-400">Upload a title deed document or click the test buttons above to compare against the ledger.</p>
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
          onDeleteLand={onDeleteLand}
          connectedAddress={connectedAddress}
          userRole={userRole}
        />
      ) : (
        <div className="glass-card p-12 rounded-3xl text-center text-stone-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <p className="text-base font-semibold text-stone-700">No land parcel selected</p>
          <p className="text-xs text-stone-400 mt-1">Use the search bar above to look up any parcel ID or property address.</p>
        </div>
      )}

      {/* Store Document into Ledger Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg rounded-3xl border border-amber-200 overflow-hidden shadow-2xl space-y-6">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-800">Store Document in Algorand Ledger</h3>
                  <p className="text-xs text-stone-400">Mint & seal a new title deed document into smart contract box storage.</p>
                </div>
              </div>
              <button onClick={() => setShowStoreModal(false)} className="text-stone-400 hover:text-stone-700 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleStoreSubmit} className="p-6 space-y-4 pt-0">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Parcel Identification Number (PIN)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PRCL-2026-5509"
                    value={storePin}
                    onChange={(e) => setStorePin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-stone-700 text-xs placeholder-stone-400"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Physical Location / Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot 12, Ocean View Boulevard"
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-stone-700 text-xs placeholder-stone-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-stone-600 block mb-1">Area (Square Feet)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 4200"
                      value={storeArea}
                      onChange={(e) => setStoreArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-stone-700 text-xs placeholder-stone-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-600 block mb-1">Owner Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Algorand wallet address..."
                      value={storeOwner}
                      onChange={(e) => setStoreOwner(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-stone-700 text-xs placeholder-stone-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Upload Document File to Compute Ledger Hash</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Computed SHA-256 Hash..."
                      value={storeDocHash}
                      onChange={(e) => setStoreDocHash(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-stone-700 text-xs placeholder-stone-400 font-mono"
                    />
                    <label className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-amber-700 text-xs font-semibold border border-stone-200 cursor-pointer whitespace-nowrap flex items-center gap-1">
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
                  {storeFileName && <span className="text-[11px] text-earth-600 font-mono block mt-1">Hashed File: {storeFileName}</span>}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isStoringDoc}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-earth-700 to-earth-600 hover:from-earth-600 hover:to-earth-500 text-white font-extrabold text-xs shadow-lg shadow-earth-600/15 cursor-pointer disabled:opacity-50"
                >
                  {isStoringDoc ? 'Processing 0.005 ALGO x402 Fee & Sealing Document...' : '💳 Authorize 0.005 ALGO (x402 Fee) & Store Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Document from Ledger Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-rose-200 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-800">Delete Document from Ledger</h3>
                  <p className="text-xs text-rose-500 font-mono">Algorand Box Storage Deregistration</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-stone-400 hover:text-stone-700 p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p>
                <strong>SECURITY WARNING:</strong> Deleting a document removes its title record and SHA-256 hash from Algorand Box Storage. Only the land owner or registrar authority can perform this action.
              </p>
            </div>

            <form onSubmit={handleDeleteSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-stone-600 font-semibold block mb-1.5">Target Parcel ID to Delete</label>
                <input
                  type="text"
                  required
                  placeholder="Enter Parcel ID (e.g. LAND-001 or PRCL-2026-8801)..."
                  value={deleteParcelInput}
                  onChange={(e) => setDeleteParcelInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-stone-700 text-xs placeholder-stone-400 font-mono uppercase"
                />
              </div>

              {parcels.length > 0 && (
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1">Quick Select Active Record:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {parcels.map((p) => (
                      <button
                        type="button"
                        key={p.parcelId}
                        onClick={() => setDeleteParcelInput(p.parcelId)}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-[11px] font-mono border border-stone-200 cursor-pointer"
                      >
                        {p.parcelId}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isDeletingDoc || !deleteParcelInput.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/15 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeletingDoc ? 'Deleting from Box Storage...' : 'Confirm & Delete Document from Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
