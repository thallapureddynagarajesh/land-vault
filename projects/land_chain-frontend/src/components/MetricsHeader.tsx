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
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Registered Land</span>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{totalParcels}</span>
          <span className="text-xs text-emerald-400 font-medium flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5" /> +100% On-Chain
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2 font-mono">Immutable AVM Box Records</p>
      </div>

      {/* Metric 2 */}
      <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gov Verified Deeds</span>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{verifiedCount}</span>
          <span className="text-xs text-cyan-400 font-medium font-mono">
            {((verifiedCount / (totalParcels || 1)) * 100).toFixed(0)}% Authenticated
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">Zero Ownership Disputes</p>
      </div>

      {/* Metric 3 */}
      <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Listings</span>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{activeListingsCount}</span>
          <span className="text-xs text-amber-400 font-medium">Atomic Marketplace</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">Peer-to-Peer Transfer</p>
      </div>

      {/* Metric 4 */}
      <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Market Volume</span>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{totalVolumeAlgos.toLocaleString()}</span>
          <span className="text-xs text-indigo-400 font-bold font-mono">ALGO</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 font-mono">Instant Settlement (~2.8s)</p>
      </div>
    </div>
  )
}
