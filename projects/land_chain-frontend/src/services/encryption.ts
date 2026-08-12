/**
 * LandVault Cryptographic Encryption & Access Control Service
 * Implements client-side AES-256-GCM encryption/decryption via Web Crypto API (crypto.subtle)
 * and wallet role access control (Owner, Buyer, Government Authority).
 */

export interface EncryptedPackage {
  encryptedBuffer: ArrayBuffer
  ivHex: string
  originalHash: string
  fileName: string
  fileType: string
}

export interface AccessPermission {
  authorized: boolean
  roleLabel: string
  reason?: string
}

/**
 * Derive a 256-bit AES-GCM CryptoKey deterministically from parcel metadata
 */
export async function deriveParcelKey(parcelId: string, ownerAddress: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(`LANDVAULT_SECRET_${parcelId}_${ownerAddress}`),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  const salt = enc.encode(`SALT_${parcelId.slice(0, 8)}`)

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt a file using AES-256-GCM before uploading to IPFS
 */
export async function encryptFileForIPFS(
  file: File,
  parcelId: string,
  ownerAddress: string
): Promise<EncryptedPackage> {
  const fileBuffer = await file.arrayBuffer()

  // 1. Compute SHA-256 hash of original unencrypted document (for Algorand Box Storage)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', fileBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const originalHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  // 2. Generate initialization vector (IV)
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, '0')).join('')

  // 3. Derive AES-GCM key and encrypt
  const cryptoKey = await deriveParcelKey(parcelId, ownerAddress)
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    cryptoKey,
    fileBuffer
  )

  return {
    encryptedBuffer,
    ivHex,
    originalHash,
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
  }
}

/**
 * Decrypt an encrypted document ArrayBuffer retrieved from IPFS
 */
export async function decryptFileFromIPFS(
  encryptedBuffer: ArrayBuffer,
  ivHex: string,
  parcelId: string,
  ownerAddress: string,
  fileType: string = 'application/pdf'
): Promise<Blob> {
  const ivBytes = new Uint8Array(
    ivHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || new Array(12).fill(0)
  )

  const cryptoKey = await deriveParcelKey(parcelId, ownerAddress)

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
    },
    cryptoKey,
    encryptedBuffer
  )

  return new Blob([decryptedBuffer], { type: fileType })
}

/**
 * Check if the current user/wallet has permission to decrypt & view the private land document
 */
export function checkWalletAccessPermission(
  parcelOwner: string,
  connectedAddress: string | null,
  userRole: 'citizen' | 'registrar' | 'investor',
  isForSale: boolean
): AccessPermission {
  const normOwner = parcelOwner.trim().toLowerCase()
  const normConnected = connectedAddress ? connectedAddress.trim().toLowerCase() : ''

  // 1. Check Government Authority Role
  if (userRole === 'registrar') {
    return {
      authorized: true,
      roleLabel: 'Government Registrar Authority',
      reason: 'Verified official government registrar authority role.',
    }
  }

  // 2. Check Land Owner Wallet Match
  if (normConnected && normConnected === normOwner) {
    return {
      authorized: true,
      roleLabel: 'Verified Titleholder Owner',
      reason: 'Your connected Algorand wallet matches the registered property owner.',
    }
  }

  // 3. Check Buyer Permission (Market Investor role or parcel listed for sale)
  if (userRole === 'investor' || isForSale) {
    return {
      authorized: true,
      roleLabel: 'Verified Prospective Buyer',
      reason: 'Authorized access for property buyer under marketplace listing terms.',
    }
  }

  // 4. Default Citizen match check
  if (userRole === 'citizen' && normConnected === normOwner) {
    return {
      authorized: true,
      roleLabel: 'Landowner Citizen',
      reason: 'Authorized titleholder access.',
    }
  }

  // Unauthorized Public Visitor
  return {
    authorized: false,
    roleLabel: 'Public Visitor / Unauthorized Wallet',
    reason: 'Document encrypted on IPFS with AES-256-GCM. Only the verified Owner, Buyer, or Government Authority can decrypt and view this document.',
  }
}
