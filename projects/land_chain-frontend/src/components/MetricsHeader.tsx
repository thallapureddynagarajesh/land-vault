import React from 'react'
import { ShieldCheck, ShoppingCart, Landmark, ArrowUpRight, Cpu } from 'lucide-react'

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
      {/* Metric 1 */}
      <div className="bg-white p-3 rounded-xl border border-stone-200/90 shadow-xs hover:border-earth-600/30 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Registered</span>
          <div className="p-1 rounded-md bg-earth-50 text-earth-700 border border-earth-100">
            <Landmark className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-stone-900 tracking-tight">{totalParcels}</span>
          <span className="text-[10px] text-earth-700 font-medium flex items-center">
            <ArrowUpRight className="w-2.5 h-2.5" /> AVM Box
          </span>
        </div>
        <p className="text-[10px] text-stone-400 mt-0.5 font-mono">Zero-Rent Storage</p>
      </div>

      {/* Metric 2 */}
      <div className="bg-white p-3 rounded-xl border border-stone-200/90 shadow-xs hover:border-green-600/30 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Gov Verified</span>
          <div className="p-1 rounded-md bg-green-50 text-green-700 border border-green-100">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-stone-900 tracking-tight">{verifiedCount}</span>
          <span className="text-[10px] text-green-700 font-bold font-mono">
            {((verifiedCount / (totalParcels || 1)) * 100).toFixed(0)}% Certified
          </span>
        </div>
        <p className="text-[10px] text-stone-400 mt-0.5">Zero Disputes</p>
      </div>

      {/* Metric 3 */}
      <div className="bg-white p-3 rounded-xl border border-stone-200/90 shadow-xs hover:border-amber-600/30 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Active Listings</span>
          <div className="p-1 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
            <ShoppingCart className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-stone-900 tracking-tight">{activeListingsCount}</span>
          <span className="text-[10px] text-amber-700 font-medium">Marketplace</span>
        </div>
        <p className="text-[10px] text-stone-400 mt-0.5">Atomic Settlement</p>
      </div>

      {/* Metric 4 */}
      <div className="bg-white p-3 rounded-xl border border-stone-200/90 shadow-xs hover:border-earth-600/30 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Market Volume</span>
          <div className="p-1 rounded-md bg-earth-50 text-earth-700 border border-earth-100">
            <Cpu className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-stone-900 tracking-tight">{totalVolumeAlgos.toLocaleString()}</span>
          <span className="text-[10px] text-earth-700 font-bold font-mono">ALGO</span>
        </div>
        <p className="text-[10px] text-stone-400 mt-0.5 font-mono">~2.8s Block Time</p>
      </div>
    </div>
  )
}
