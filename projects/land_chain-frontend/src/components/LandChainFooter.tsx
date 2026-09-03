import React from 'react'
import { ShieldCheck, Cpu, Database, Lock, Code2, Globe, ExternalLink } from 'lucide-react'

export const LandChainFooter: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-earth-600/10 bg-white/80 backdrop-blur-sm py-6 text-xs text-stone-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Mission */}
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-md bg-earth-600/10 flex items-center justify-center border border-earth-600/20">
              <ShieldCheck className="w-4 h-4 text-earth-600" />
            </div>
            <div>
              <span className="font-bold text-stone-800">LandVault Registry</span>
              <span className="text-stone-400 mx-2">•</span>
              <span className="text-stone-500 text-[11px]">Algorand ARC-4 Smart Contract Box Storage + IPFS AES-256</span>
            </div>
          </div>

          {/* Quick Specs / Trust Chips */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-600">
              App ID: #10084920
            </span>
            <span className="px-2 py-0.5 rounded-md bg-green-50 border border-green-200 text-green-700 font-sans flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> Operational (~2.8s finality)
            </span>
          </div>

          {/* External Links & Copyright */}
          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <a
              href="https://algorand.co"
              target="_blank"
              rel="noreferrer"
              className="hover:text-earth-600 transition-colors flex items-center gap-1"
            >
              Algorand <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://ipfs.tech"
              target="_blank"
              rel="noreferrer"
              className="hover:text-earth-600 transition-colors flex items-center gap-1"
            >
              IPFS <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span>© {new Date().getFullYear()} LandVault System</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
