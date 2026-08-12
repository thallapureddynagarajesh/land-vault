/**
 * LandVault x402 HTTP Payment Gateway & Middleware
 * Implements HTTP 402 Payment Required microtransactions for automated API access,
 * AI agent queries, cryptographic deed verification, and audit trail exports on Algorand.
 */

export interface X402EndpointConfig {
  endpoint: string
  name: string
  description: string
  priceAlgos: number
  priceMicroAlgos: number
  targetAudience: string
}

// Recommended x402 Monetization Pricing Table
export const X402_PRICING_TABLE: Record<string, X402EndpointConfig> = {
  '/api/v1/verify-deed': {
    endpoint: '/api/v1/verify-deed',
    name: 'Deed Integrity & Title Verification',
    description: 'Cryptographic SHA-256 hash match against Algorand Box Storage.',
    priceAlgos: 0.1,
    priceMicroAlgos: 100000, // 0.1 ALGO (~$0.02)
    targetAudience: 'Banks, Legal Auditors, Conveyancers, AI Agents',
  },
  '/api/v1/ipfs-decrypt-token': {
    endpoint: '/api/v1/ipfs-decrypt-token',
    name: 'AES-256 Encrypted IPFS Access Token',
    description: 'Generates secure decryption token for authorized title deed viewing.',
    priceAlgos: 0.5,
    priceMicroAlgos: 500000, // 0.5 ALGO (~$0.10)
    targetAudience: 'Buyer Conveyancers, Escrow Services, Title Insurers',
  },
  '/api/v1/audit-trail': {
    endpoint: '/api/v1/audit-trail',
    name: 'Provenance & Block History Export',
    description: 'Full chronological history of transfers, block rounds, and tx hashes.',
    priceAlgos: 0.2,
    priceMicroAlgos: 200000, // 0.2 ALGO (~$0.04)
    targetAudience: 'Risk Analysts, Financial Institutions, Insurers',
  },
  '/api/v1/export-deed-pdf': {
    endpoint: '/api/v1/export-deed-pdf',
    name: 'Official Certified Deed PDF Export',
    description: 'Generates official PDF Title Certificate sealed with Algorand QR code.',
    priceAlgos: 1.0,
    priceMicroAlgos: 1000000, // 1.0 ALGO (~$0.20)
    targetAudience: 'Landowners, Real Estate Brokers, Legal Firms',
  },
  '/api/v1/bulk-search': {
    endpoint: '/api/v1/bulk-search',
    name: 'Spatial & Bulk Parcel Analytics',
    description: 'High-volume spatial query across multiple land parcels.',
    priceAlgos: 0.05,
    priceMicroAlgos: 50000, // 0.05 ALGO per parcel
    targetAudience: 'PropTech Companies, Urban Planners, Data Aggregators',
  },
}

export interface X402PaymentResponse {
  status: 402
  message: string
  headers: {
    'X-Payment-Address': string
    'X-Payment-Amount': string
    'X-Payment-Currency': string
    'X-Payment-Network': string
    'X-Payment-Endpoint': string
  }
}

/**
 * Generate HTTP 402 Payment Required response payload & headers
 */
export function createX402PaymentChallenge(
  endpointKey: string,
  receiverAddress: string = 'GOV_REVENUE_COLLECTION_WALLET_ADDRESS'
): X402PaymentResponse {
  const config = X402_PRICING_TABLE[endpointKey] || X402_PRICING_TABLE['/api/v1/verify-deed']

  return {
    status: 402,
    message: `Payment Required: Endpoint ${config.endpoint} costs ${config.priceAlgos} ALGO. Send microtransaction proof header 'X-Payment-Proof: <TX_HASH>'.`,
    headers: {
      'X-Payment-Address': receiverAddress,
      'X-Payment-Amount': String(config.priceMicroAlgos),
      'X-Payment-Currency': 'ALGO',
      'X-Payment-Network': 'algorand-mainnet',
      'X-Payment-Endpoint': config.endpoint,
    },
  }
}

/**
 * Verify on-chain payment transaction proof submitted in request header 'X-Payment-Proof'
 */
export async function verifyX402PaymentProof(
  txHash: string,
  expectedMicroAlgos: number,
  receiverAddress: string,
  algodClient?: any
): Promise<{ success: boolean; error?: string }> {
  if (!txHash || txHash.trim().length < 20) {
    return { success: false, error: 'Invalid or missing X-Payment-Proof transaction hash header.' }
  }

  // Simulated on-chain Algod verification check for valid transaction proof
  if (txHash.startsWith('TX-') || txHash.length >= 32) {
    return { success: true }
  }

  return { success: false, error: 'On-chain payment proof transaction verification failed.' }
}
