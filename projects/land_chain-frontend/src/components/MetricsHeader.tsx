import React from 'react'
import { ShieldCheck, FileCheck, ShoppingCart, Landmark, ArrowUpRight, Cpu } from 'lucide-react'

interface MetricsHeaderProps {
  totalParcels: number
  verifiedCount: number
  activeListingsCount: number
  totalVolumeAlgos: number
}

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({
  totalParcels,
  verifiedCount,
  activeListingsCount,
  totalVolumeAlgos,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Metric 1 */}
      <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-earth-600/5 rounded-full blur-xl group-hover:bg-earth-600/10 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Registered Land</span>
          <div className="p-2.5 rounded-xl bg-earth-600/10 text-earth-600 border border-earth-600/15">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-stone-800 tracking-tight">{totalParcels}</span>
          <span className="text-xs text-earth-600 font-medium flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5" /> +100% On-Chain
          </span>
        </div>
        <p className="text-xs text-stone-400 mt-2 font-mono">Immutable AVM Box Records</p>
      </div>

      {/* Metric 2 */}
      <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-green-600/5 rounded-full blur-xl group-hover:bg-green-600/10 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Gov Verified Deeds</span>
          <div className="p-2.5 rounded-xl bg-green-600/10 text-green-700 border border-green-600/15">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-stone-800 tracking-tight">{verifiedCount}</span>
          <span className="text-xs text-green-700 font-medium font-mono">
            {((verifiedCount / (totalParcels || 1)) * 100).toFixed(0)}% Authenticated
          </span>
        </div>
        <p className="text-xs text-stone-400 mt-2">Zero Ownership Disputes</p>
      </div>

      {/* Metric 3 */}
      <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Active Listings</span>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/15">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-stone-800 tracking-tight">{activeListingsCount}</span>
          <span className="text-xs text-amber-600 font-medium">Atomic Marketplace</span>
        </div>
        <p className="text-xs text-stone-400 mt-2">Peer-to-Peer Transfer</p>
      </div>

      {/* Metric 4 */}
      <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-earth-400/5 rounded-full blur-xl group-hover:bg-earth-400/10 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Market Volume</span>
          <div className="p-2.5 rounded-xl bg-earth-400/10 text-earth-700 border border-earth-400/15">
            <Cpu className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-stone-800 tracking-tight">{totalVolumeAlgos.toLocaleString()}</span>
          <span className="text-xs text-earth-700 font-bold font-mono">ALGO</span>
        </div>
        <p className="text-xs text-stone-400 mt-2 font-mono">Instant Settlement (~2.8s)</p>
      </div>
    </div>
  )
}
