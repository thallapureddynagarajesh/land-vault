/**
 * LandVault Property & Smart Contract Data Interfaces
 */

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface OwnershipHistoryRecord {
  previousOwner: string
  newOwner: string
  timestamp: number
  transactionId?: string
}

export interface LandParcel {
  parcelId: string
  surveyNumber: string
  location: string
  areaSqft: number
  propertyType: string
  documentType: string
  owner: string
  isApproved: boolean
  isForSale: boolean
  priceMicroAlgos: number
  ipfsCid: string
  documentHash: string
  createdAt: number
  lastTransferAt: number
  transactionId?: string
  status: VerificationStatus
  verifiedBy?: string
  verificationTimestamp?: number
  rejectionReason?: string
  transferCount?: number
  ownershipHistory?: OwnershipHistoryRecord[]
}

export interface AuditEvent {
  id: string
  parcelId: string
  eventType: string
  fromAddress?: string
  toAddress?: string
  priceAlgos?: number
  timestamp: number
  blockRound: number
  txHash: string
}

export interface AuditTrailEvent {
  parcelId: string
  eventType: 'REGISTRATION_SUBMITTED' | 'REGISTRAR_APPROVED' | 'REGISTRAR_REJECTED' | 'LISTED_FOR_SALE' | 'OWNERSHIP_TRANSFERRED' | 'DELISTED'
  actorAddress: string
  timestamp: number
  txId: string
  blockRound: number
  details: string
}
