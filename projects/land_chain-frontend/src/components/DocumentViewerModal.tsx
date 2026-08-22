import React, { useState, useEffect } from 'react'
import { X, ShieldCheck, Download, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, Eye, Lock, FileText, Globe } from 'lucide-react'
import { LandParcel } from '../interfaces/land'
import { fetchFileFromIPFS, getAllGatewayUrls, getIPFSGatewayUrl } from '../services/ipfs'
import { decryptFileFromIPFS, detectMimeType } from '../services/encryption'

interface DocumentViewerModalProps {
  parcel: LandParcel | null
  onClose: () => void
}

/**
 * Detect if a CID is a placeholder/demo CID that won't resolve on real IPFS gateways.
 * Seed data uses pseudo-CIDs like "QmXoypiz..." or short generated hashes.
 */
function isPlaceholderCid(cid: string): boolean {
  if (!cid) return true
  const cleanCid = cid.replace('ipfs://', '').replace('/', '')
  // Real Pinata-uploaded CIDs are 46+ chars and start with Qm or bafy
  // Our seed data uses deterministic pseudo-CIDs
  if (cleanCid.length < 46) return true
  // Known demo CIDs from seed data
  const knownDemoCids = [
    'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    'QmZ3k9XyB8W7P2K1L5M4N3J6H7G8F9E0D1C2B3A4S5',
    'QmY1x2Z3W4V5U6T7S8R9Q0P1O2N3M4L5K6J7I8H9',
    'QmK9J8I7H6G5F4E3D2C1B0A9Z8Y7X6W5V4U3T2S1',
    'QmHilltopHash123CID',
  ]
  if (knownDemoCids.includes(cleanCid)) return true
  return false
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ parcel, onClose }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string>('application/pdf')
  const [selectedGateway, setSelectedGateway] = useState<string>('https://cloudflare-ipfs.com/ipfs/')
  const [isDemoDocument, setIsDemoDocument] = useState(false)

  useEffect(() => {
    if (!parcel) return

    let isMounted = true
    setIsLoading(true)
    setErrorMsg(null)
    setBlobUrl(null)
    setIsDemoDocument(false)

    const loadAndDecryptDocument = async () => {
      // Check if this is a demo/placeholder CID first
      if (isPlaceholderCid(parcel.ipfsCid)) {
        if (isMounted) {
          setIsDemoDocument(true)
          setIsLoading(false)
        }
        return
      }

      try {
        // 1. Multi-gateway fetch
        let buffer: ArrayBuffer
        try {
          buffer = await fetchFileFromIPFS(parcel.ipfsCid)
        } catch {
          const directUrl = getIPFSGatewayUrl(parcel.ipfsCid, selectedGateway)
          const resp = await fetch(directUrl)
          if (!resp.ok) throw new Error(`Gateway fetch status: ${resp.statusText}`)
          buffer = await resp.arrayBuffer()
        }

        // 2. Try decrypt using Web Crypto AES-256-GCM
        try {
          const blob = await decryptFileFromIPFS(
            buffer,
            parcel.documentHash.slice(0, 24),
            parcel.parcelId,
            parcel.owner
          )
          if (isMounted) {
            setMimeType(blob.type || 'application/pdf')
            const url = URL.createObjectURL(blob)
            setBlobUrl(url)
            setIsLoading(false)
          }
        } catch (decryptErr) {
          // Fallback: raw unencrypted document — detect MIME from magic bytes
          if (isMounted) {
            const detectedMime = detectMimeType(buffer)
            const rawBlob = new Blob([buffer], { type: detectedMime })
            setMimeType(detectedMime)
            setBlobUrl(URL.createObjectURL(rawBlob))
            setIsLoading(false)
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('IPFS Document Load Note:', err)
          setErrorMsg('Unable to retrieve document from IPFS gateways. The document may not have been uploaded yet, or the CID may be invalid.')
          setIsLoading(false)
        }
      }
    }

    loadAndDecryptDocument()

    return () => {
      isMounted = false
    }
  }, [parcel, selectedGateway])

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [blobUrl])

  if (!parcel) return null

  const rawGatewayUrl = getIPFSGatewayUrl(parcel.ipfsCid, selectedGateway)
  const allGateways = getAllGatewayUrls(parcel.ipfsCid)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-4xl w-full p-6 rounded-3xl border border-earth-600/20 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-earth-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-earth-600/10 text-earth-600 border border-earth-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-stone-800 font-mono">{parcel.parcelId}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-earth-300/20 text-earth-700 border border-earth-300/30 font-mono">
                  {parcel.surveyNumber || `SURVEY-${parcel.parcelId}`}
                </span>
              </div>
              <p className="text-xs text-stone-500">Decrypted Title Deed & Document Verification Viewer</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-3.5 rounded-2xl border border-earth-200/50">
          <div>
            <span className="text-stone-400 block text-[11px]">Property Type</span>
            <span className="font-semibold text-earth-600">{parcel.propertyType}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Document Type</span>
            <span className="font-semibold text-stone-700">{parcel.documentType}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Location</span>
            <span className="font-semibold text-stone-600 truncate block">{parcel.location}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Status</span>
            <span className={`font-bold ${parcel.status === 'VERIFIED' ? 'text-green-700' : parcel.status === 'REJECTED' ? 'text-rose-600' : 'text-amber-600'}`}>
              {parcel.status === 'VERIFIED' ? '🟢 VERIFIED' : parcel.status === 'REJECTED' ? '🔴 REJECTED' : '🟡 PENDING'}
            </span>
          </div>
        </div>

        {/* Document Viewer Container */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-earth-200/50 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-stone-600 flex items-center gap-2">
              <Lock className="w-4 h-4 text-earth-600" /> Decrypted Document Content
            </span>

            {blobUrl && (
              <div className="flex items-center gap-2">
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                </a>
                <a
                  href={blobUrl}
                  download={`${parcel.parcelId}_DEED`}
                  className="px-3.5 py-1.5 rounded-lg bg-earth-600 hover:bg-earth-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <Download className="w-3.5 h-3.5" /> Download Original File
                </a>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-xl border border-earth-200/50 space-y-3">
              <RefreshCw className="w-8 h-8 text-earth-600 animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-semibold">Retrieving from IPFS Gateways & Decrypting AES-256-GCM Payload...</p>
            </div>
          ) : isDemoDocument ? (
            <div className="p-8 bg-white rounded-xl border border-earth-300/30 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-earth-600/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-earth-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-800">Demo Land Title Deed</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  This is a seed/demo record with a placeholder IPFS CID. When you upload a real document via the "Upload Land Document" tab,
                  the encrypted file will be stored on IPFS and viewable here with full AES-256-GCM decryption.
                </p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-earth-200/50 text-xs font-mono text-stone-500 break-all max-w-md mx-auto">
                <span className="text-stone-400 block text-[10px] mb-1">Placeholder CID:</span>
                {parcel.ipfsCid}
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">Document record is registered on-chain — actual file pending IPFS upload</span>
              </div>
            </div>
          ) : blobUrl ? (
            mimeType.startsWith('image/') ? (
              <div className="p-3 bg-white rounded-xl border border-earth-200/50 flex justify-center items-center">
                <img
                  src={blobUrl}
                  alt="Decrypted Land Deed Document"
                  className="max-h-96 w-auto max-w-full rounded-lg object-contain shadow-lg"
                />
              </div>
            ) : (
              <iframe
                src={blobUrl}
                title="Decrypted Document Content"
                className="w-full h-96 rounded-xl border border-earth-200/50 bg-white"
              />
            )
          ) : (
            <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-700">
                <AlertTriangle className="w-4 h-4" /> Document Retrieval Notice
              </div>
              <p>{errorMsg}</p>
              <p className="text-[11px] text-amber-600">Try switching to a different IPFS gateway below, or verify the CID is correct.</p>
              {!isPlaceholderCid(parcel.ipfsCid) && (
                <a
                  href={rawGatewayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold hover:bg-amber-200 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" /> Try Direct Gateway Link
                </a>
              )}
            </div>
          )}
        </div>

        {/* IPFS Multi-Gateway Resolver */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-earth-200/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-earth-500" /> Multi-Gateway Provider Fallback
            </span>
            <span className="font-mono text-[11px] text-stone-400 truncate max-w-xs">{parcel.ipfsCid}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allGateways.map((g) => (
              <button
                key={g.name}
                onClick={() => setSelectedGateway(g.url)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border text-left truncate transition-colors cursor-pointer ${
                  selectedGateway === g.url
                    ? 'bg-earth-600/10 text-earth-700 border-earth-600/30'
                    : 'bg-white text-stone-500 border-stone-200 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
