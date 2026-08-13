import { useWallet } from '@txnlab/use-wallet-react'
import { useMemo, useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { ellipseAddress } from '../utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

const Account = () => {
  const { activeAddress } = useWallet()
  const [copied, setCopied] = useState(false)
  const algoConfig = getAlgodConfigFromViteEnvironment()

  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLocaleLowerCase()
  }, [algoConfig.network])

  const handleCopy = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <div>
        <span className="text-xs text-slate-400 font-medium block mb-1">Connected Algorand Account</span>
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
          <span className="truncate">{activeAddress ? activeAddress : 'No active account'}</span>
          {activeAddress && (
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-sans font-semibold flex items-center gap-1 cursor-pointer shrink-0"
              title="Copy Address to Clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Address
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
        <span className="text-slate-400">Network: <strong className="text-white uppercase font-mono">{networkName}</strong></span>
        {activeAddress && (
          <a
            className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
            target="_blank"
            rel="noreferrer"
            href={`https://lora.algokit.io/${networkName}/account/${activeAddress}/`}
          >
            Lora Explorer <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}

export default Account
