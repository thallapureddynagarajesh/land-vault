export interface LandParcel {
  parcelId: string
  location: string
  areaSqft: number
  propertyType: 'Residential' | 'Commercial' | 'Agricultural' | 'Industrial'
  documentType: string // e.g. "Sale Deed", "Title Deed", "Ownership Certificate", "Registration Certificate"
  owner: string
  isApproved: boolean
  isForSale: boolean
  priceMicroAlgos: number
  ipfsCid: string // IPFS Content Identifier
  documentHash: string // SHA-256 cryptographic document hash
  createdAt: number
  lastTransferAt: number
  transactionId?: string
}

export interface AuditEvent {
  id: string
  parcelId: string
  eventType: 'REGISTRATION' | 'GOV_APPROVAL' | 'LISTED_FOR_SALE' | 'OWNERSHIP_TRANSFER' | 'PURCHASE' | 'DELISTED'
  fromAddress?: string
  toAddress?: string
  priceAlgos?: number
  timestamp: number
  blockRound: number
  txHash: string
}
