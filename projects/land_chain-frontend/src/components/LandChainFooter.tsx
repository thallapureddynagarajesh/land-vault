import React from 'react'
import { ShieldCheck, Cpu, Database, Lock, Code2, Globe } from 'lucide-react'

export const LandChainFooter: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-earth-200/50 bg-earth-800 pt-12 pb-8 text-xs text-earth-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-earth-300" />
              <span className="font-extrabold text-lg text-white">LandChain</span>
            </div>
            <p className="text-xs text-earth-300 leading-relaxed">
              Decentralized, tamper-proof secure land registry powered by Algorand smart contracts & IPFS document encryption.
            </p>
          </div>

          {/* Architecture Specs */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-earth-300" /> Blockchain Standard
            </h4>
            <ul className="space-y-2 text-[11px] text-earth-300 font-mono">
              <li>• Algorand AVM (ARC-4 standard)</li>
              <li>• Puya PyTeal / Algopy Smart Contract</li>
              <li>• On-Chain Box Storage (Zero Rent Leak)</li>
              <li>• Block Time: ~2.8 seconds finality</li>
            </ul>
          </div>

          {/* Security & Decentralization */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-earth-300" /> Trust & Compliance
            </h4>
            <ul className="space-y-2 text-[11px] text-earth-300">
              <li>• Government Registrar Validation</li>
              <li>• IPFS Cryptographic Title Deed Hashes</li>
              <li>• Peer-to-Peer Atomic Payment Transfer</li>
              <li>• Immutable Provenance & Audit Logs</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-earth-300" /> Resources
            </h4>
            <ul className="space-y-2 text-[11px] text-earth-300">
              <li>
                <a href="https://algorand.co" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Algorand Network
                </a>
              </li>
              <li>
                <a href="https://github.com/algorandfoundation/algokit-cli" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <Code2 className="w-3 h-3" /> AlgoKit Standard
                </a>
              </li>
              <li>
                <span className="text-earth-400">Smart Contract App ID: #10084920</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-earth-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-earth-400">
          <p>© {new Date().getFullYear()} LandChain Secure Registry System. Built on Algorand Blockchain.</p>
          <div className="flex items-center gap-4">
            <span>Terms of Service</span>
            <span>Privacy Standard</span>
            <span>Government API</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
