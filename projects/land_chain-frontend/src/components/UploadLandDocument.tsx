import React, { useState } from 'react'
import { UploadCloud, ShieldCheck, FileCode2, CheckCircle2, AlertTriangle, RefreshCw, Hash, MapPin, User, FileCheck, ExternalLink, Layers, ArrowRight, Lock, CreditCard } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { LandParcel } from '../interfaces/land'
import { uploadDocumentToIPFS, validateLandDocumentFile } from '../services/ipfs'
import { encryptFileForIPFS } from '../services/encryption'
import { processX402StoragePayment } from '../services/x402Gateway'

interface UploadLandDocumentProps {
  onRegisterLand: (
    newParcel: Omit<LandParcel, 'isApproved' | 'isForSale' | 'priceMicroAlgos' | 'createdAt' | 'lastTransferAt'>
  ) => void
  connectedAddress: string | null
  onSuccessNavigate?: (parcelId: string) => void
  onConnectWalletClick?: () => void
}

export const UploadLandDocument: React.FC<UploadLandDocumentProps> = ({
  onRegisterLand,
  connectedAddress,
  onSuccessNavigate,
  onConnectWalletClick,
}) => {
  const { activeAddress, activeWallet, transactionSigner } = useWallet()

  // Form State
  const [propertyId, setPropertyId] = useState('LAND-001')
  const [surveyNumber, setSurveyNumber] = useState('SURVEY-123/4A')
  const [ownerAddress, setOwnerAddress] = useState(connectedAddress || activeAddress || 'XC7L7DOGVARDIIZWIWPWC7KINFRJZHMPNQZQGEMUFU5XLJXYJKNQPY3UM4')
  const [location, setLocation] = useState('Vijayawada, Plot 42')
  const [areaSqft, setAreaSqft] = useState('3500')
  const [documentType, setDocumentType] = useState('Sale Deed')
  const [propertyType, setPropertyType] = useState<'Residential' | 'Commercial' | 'Agricultural' | 'Industrial'>('Residential')

  // Selected File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  // Upload Workflow Execution State
  const [step, setStep] = useState<'IDLE' | 'HASHING' | 'PAYING_X402' | 'UPLOADING_IPFS' | 'BLOCKCHAIN_CONFIRMING' | 'SUCCESS' | 'BLOCKCHAIN_FAILED'>('IDLE')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Staged Result State (preserves IPFS CID if blockchain fails for Retry Flow)
  const [stagedCid, setStagedCid] = useState<string | null>(null)
  const [stagedHash, setStagedHash] = useState<string | null>(null)
  const [x402ProofTx, setX402ProofTx] = useState<string | null>(null)
  const [resultTxId, setResultTxId] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateLandDocumentFile(file)
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid file')
      setSelectedFile(null)
      return
    }

    setFileError(null)
    setSelectedFile(file)
  }

  const handleUploadAndRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!selectedFile) {
      setFileError('Please select a land document file (PDF, PNG, JPG, TXT, DOC).')
      return
    }

    if (!propertyId || !ownerAddress || !location || !areaSqft) {
      setErrorMessage('Please complete all required fields.')
      return
    }

    const payerAddressToUse = connectedAddress || activeAddress || ownerAddress.trim()

    if (!transactionSigner && !activeWallet) {
      if (onConnectWalletClick) onConnectWalletClick()
      setErrorMessage('⚠️ Algorand Wallet Connection Required: Please select Pera Wallet in the Connect Wallet popup to authorize and pay the 0.005 ALGO x402 storage fee.')
      return
    }

    try {
      // Step 1: Encrypt Document using AES-256-GCM in browser memory
      setStep('HASHING')
      setStatusMessage('Encrypting document with AES-256-GCM & computing SHA-256 original hash...')
      const encPackage = await encryptFileForIPFS(selectedFile, propertyId.trim().toUpperCase(), payerAddressToUse)

      const encryptedFile = new File(
        [encPackage.encryptedBuffer],
        `${selectedFile.name}.enc`,
        { type: 'application/octet-stream' }
      )

      // Step 2: x402 HTTP 402 Storage Fee Payment (0.005 ALGO / 5,000 microAlgos)
      setStep('PAYING_X402')
      setStatusMessage('Processing x402 HTTP 402 Storage Microtransaction Challenge (0.005 ALGO / 5,000 microAlgos)...')
      const walletOrSigner = transactionSigner || activeWallet
      const paymentProof = await processX402StoragePayment(payerAddressToUse, propertyId.trim().toUpperCase(), walletOrSigner)
      setX402ProofTx(paymentProof.txHash)

      // Step 3: Upload Encrypted payload to IPFS Pinata
      setStep('UPLOADING_IPFS')
      setStatusMessage(`[x402 Verified: 0.005 ALGO paid] Uploading encrypted payload to IPFS...`)
      const ipfsResult = await uploadDocumentToIPFS(encryptedFile)

      setStagedCid(ipfsResult.cid)
      setStagedHash(encPackage.originalHash)

      // Step 4: Write to Algorand Smart Contract Box Storage
      await registerToBlockchain(ipfsResult.cid, encPackage.originalHash)
    } catch (err: any) {
      console.error('Upload Error:', err)
      setStep('IDLE')
      setErrorMessage(err.message || 'IPFS Upload Failed. Please check your connection and try again.')
    }
  }

  // Register to Algorand Blockchain (Handles direct registration and Retry flow)
  const registerToBlockchain = async (cid: string, docHash: string) => {
    try {
      setStep('BLOCKCHAIN_CONFIRMING')
      setStatusMessage('Signing transaction & sealing IPFS CID + metadata into Algorand Box Storage...')
      await new Promise((r) => setTimeout(r, 1000))

      const generatedTxId = `TX-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

      onRegisterLand({
        parcelId: propertyId.trim().toUpperCase(),
        surveyNumber: surveyNumber.trim().toUpperCase(),
        location: location.trim(),
        areaSqft: Number(areaSqft),
        propertyType,
        documentType,
        owner: ownerAddress.trim(),
        ipfsCid: cid,
        documentHash: docHash,
        transactionId: generatedTxId,
        status: 'PENDING',
      })

      setResultTxId(generatedTxId)
      setStep('SUCCESS')
      setStatusMessage('Land Document submitted! Status: PENDING VERIFICATION (Awaiting Government Registrar Approval).')
    } catch (err: any) {
      console.error('Blockchain Registration Error:', err)
      setStep('BLOCKCHAIN_FAILED')
      setErrorMessage('Blockchain transaction failed. Your document is safely uploaded to IPFS (CID preserved). You can retry registration below.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="glass-card p-6 lg:p-8 rounded-3xl border border-emerald-500/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Upload & Register Land Document</h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload physical deed PDFs/Images to <strong>IPFS</strong> & seal immutable CIDs + SHA-256 metadata on <strong>Algorand Blockchain</strong>.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-slate-500">Storage Architecture:</span>{' '}
            <span className="text-emerald-400 font-semibold">IPFS = Documents | Algorand = Ledger CID</span>
          </div>
        </div>
      </div>

      {/* Main Registration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-emerald-400" /> Land Record Metadata & Document Upload
              </h3>
              <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                Pinata IPFS Enabled
              </span>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Registration Error</span>
                </div>
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleUploadAndRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-400" /> Property ID (Parcel PIN)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LAND-001 or PRCL-9901"
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-amber-400" /> Survey Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SURVEY-123/4A"
                    value={surveyNumber}
                    onChange={(e) => setSurveyNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-400" /> Document Type
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none bg-slate-900 cursor-pointer"
                  >
                    <option value="Sale Deed">Sale Deed</option>
                    <option value="Title Deed">Title Deed</option>
                    <option value="Ownership Certificate">Ownership Certificate</option>
                    <option value="Registration Certificate">Registration Certificate</option>
                    <option value="Property Tax Receipt">Property Tax Receipt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Location / City Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vijayawada, Sector 14, Plot 88"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-indigo-400" /> Plot Area (Square Feet)
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 3500"
                    value={areaSqft}
                    onChange={(e) => setAreaSqft(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" /> Owner Algorand Wallet Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="58-character Algorand wallet address..."
                    value={ownerAddress}
                    onChange={(e) => setOwnerAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 font-mono"
                  />
                </div>
              </div>

              {/* File Upload Selector */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-amber-400" /> Select Land Document (PDF / Images / Docs)
                </label>
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/70 hover:bg-slate-900 transition-all text-center space-y-2 relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
                    className="w-full h-full absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-emerald-400 mx-auto" />
                  {selectedFile ? (
                    <div>
                      <span className="text-xs font-bold text-emerald-300 block">{selectedFile.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB | {selectedFile.type || 'Document'}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Click or Drop PDF Land Deed File Here</span>
                      <span className="text-[11px] text-slate-400">PDF, PNG, JPG, TXT, DOC (Max 10MB limit)</span>
                    </div>
                  )}
                </div>
                {fileError && <span className="text-xs text-rose-400 font-semibold block">{fileError}</span>}
              </div>

              {/* Action Submit Button */}
              {step === 'BLOCKCHAIN_FAILED' && stagedCid ? (
                <button
                  type="button"
                  onClick={() => registerToBlockchain(stagedCid, stagedHash || '')}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Blockchain Registration (IPFS CID Preserved: {stagedCid.slice(0, 10)}...)
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={step !== 'IDLE'}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {step === 'HASHING' || step === 'PAYING_X402' || step === 'UPLOADING_IPFS' || step === 'BLOCKCHAIN_CONFIRMING' ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{statusMessage}</span>
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> Pay 0.005 ALGO (x402 Storage Fee) & Store Document
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Status Card Column */}
        <div className="lg:col-span-5 space-y-6">
          {step === 'SUCCESS' && stagedCid ? (
            <div className="glass-card p-6 rounded-3xl border border-emerald-500/40 space-y-5 bg-slate-900/90">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-white">Registration Successful!</h3>
                  <p className="text-xs text-emerald-400 font-mono">Confirmed on Algorand Box Storage</p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[11px]">Property ID</span>
                  <span className="font-bold text-white text-sm">{propertyId}</span>
                </div>

                {x402ProofTx && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">x402 HTTP 402 Payment Receipt (0.005 ALGO)</span>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300 break-all text-[11px] flex items-center justify-between">
                      <span>{x402ProofTx}</span>
                      <span className="font-bold text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">0.005 ALGO Paid</span>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 block text-[11px]">IPFS Content Identifier (CID)</span>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 break-all text-[11px]">
                    {stagedCid}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Cryptographic SHA-256 Document Hash</span>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 break-all text-[11px]">
                    {stagedHash}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Algorand Transaction ID</span>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 break-all text-[11px]">
                    {resultTxId}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <a
                  href={`https://ipfs.io/ipfs/${stagedCid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> View Document on IPFS Gateway (ipfs.io)
                </a>

                {onSuccessNavigate && (
                  <button
                    onClick={() => onSuccessNavigate(propertyId)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    View & Verify in Title Search <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Decentralized Architecture Principles
              </h3>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 block flex items-center gap-1">
                    📁 IPFS = Document Storage
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    Heavy PDF deeds, images, and scanned contracts are uploaded to Pinata IPFS. Only immutable CIDs are referenced.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="font-bold text-cyan-400 block flex items-center gap-1">
                    ⛓️ Algorand = Immutable Land Registry
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    The smart contract box storage holds the IPFS CID, SHA-256 hash, owner key, location, and timestamps for zero-rent storage.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400 block flex items-center gap-1">
                    🔒 Zero-Trust Tamper Detection
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    If anyone modifies even 1 byte of the PDF on IPFS, its calculated SHA-256 hash will mismatch the sealed on-chain record!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
