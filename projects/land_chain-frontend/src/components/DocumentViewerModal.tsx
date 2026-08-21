import React, { useState, useEffect } from 'react'
import { X, ShieldCheck, Download, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, Eye, Lock, FileText, Globe } from 'lucide-react'
import { LandParcel } from '../interfaces/land'
import { fetchFileFromIPFS, getAllGatewayUrls, getIPFSGatewayUrl } from '../services/ipfs'
import { decryptFileFromIPFS } from '../services/encryption'

interface DocumentViewerModalProps {
  parcel: LandParcel | null
  onClose: () => void
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ parcel, onClose }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string>('application/pdf')
  const [selectedGateway, setSelectedGateway] = useState<string>('https://cloudflare-ipfs.com/ipfs/')

  useEffect(() => {
    if (!parcel) return

    let isMounted = true
    setIsLoading(true)
    setErrorMsg(null)
    setBlobUrl(null)

    const loadAndDecryptDocument = async () => {
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

        // 2. Decrypt in memory using Web Crypto AES-256-GCM
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
          // Fallback raw binary blob if legacy unencrypted document
          if (isMounted) {
            const rawBlob = new Blob([buffer], { type: 'application/pdf' })
            setMimeType('application/pdf')
            setBlobUrl(URL.createObjectURL(rawBlob))
            setIsLoading(false)
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('IPFS Document Load Note:', err)
          setErrorMsg('Direct IPFS download link provided below.')
          setIsLoading(false)
        }
      }
    }

    loadAndDecryptDocument()

    return () => {
      isMounted = false
    }
  }, [parcel, selectedGateway])

  if (!parcel) return null

  const rawGatewayUrl = getIPFSGatewayUrl(parcel.ipfsCid, selectedGateway)
  const allGateways = getAllGatewayUrls(parcel.ipfsCid)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-4xl w-full p-6 rounded-3xl border border-emerald-500/40 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{parcel.parcelId}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                  {parcel.surveyNumber || `SURVEY-${parcel.parcelId}`}
                </span>
              </div>
              <p className="text-xs text-slate-400">Decrypted Title Deed & Document Verification Viewer</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div>
            <span className="text-slate-500 block text-[11px]">Property Type</span>
            <span className="font-semibold text-emerald-400">{parcel.propertyType}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Document Type</span>
            <span className="font-semibold text-white">{parcel.documentType}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Location</span>
            <span className="font-semibold text-slate-200 truncate block">{parcel.location}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Status</span>
            <span className={`font-bold ${parcel.status === 'VERIFIED' ? 'text-emerald-400' : parcel.status === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'}`}>
              {parcel.status === 'VERIFIED' ? '🟢 VERIFIED' : parcel.status === 'REJECTED' ? '🔴 REJECTED' : '🟡 PENDING'}
            </span>
          </div>
        </div>

        {/* Document Viewer Container */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> Decrypted Document Content
            </span>

            {blobUrl && (
              <div className="flex items-center gap-2">
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                </a>
                <a
                  href={blobUrl}
                  download={`${parcel.parcelId}_DEED`}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <Download className="w-3.5 h-3.5" /> Download Original File
                </a>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-semibold">Retrieving from IPFS Gateways & Decrypting AES-256-GCM Payload...</p>
            </div>
          ) : blobUrl ? (
            mimeType.startsWith('image/') ? (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-center items-center">
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
                className="w-full h-96 rounded-xl border border-slate-800 bg-slate-900"
              />
            )
          ) : (
            <div className="p-6 bg-slate-900/80 rounded-xl border border-amber-500/30 text-xs text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" /> Multi-Gateway IPFS Resolver
              </div>
              <p>{errorMsg}</p>
              <a
                href={rawGatewayUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-200 font-bold hover:bg-amber-500/30"
              >
                <Globe className="w-3.5 h-3.5" /> Open IPFS Gateway File Direct
              </a>
            </div>
          )}
        </div>

        {/* IPFS Multi-Gateway Resolver */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Multi-Gateway Provider Fallback
            </span>
            <span className="font-mono text-[11px] text-slate-400 truncate max-w-xs">{parcel.ipfsCid}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allGateways.map((g) => (
              <button
                key={g.name}
                onClick={() => setSelectedGateway(g.url)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border text-left truncate transition-colors cursor-pointer ${
                  selectedGateway === g.url
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
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
