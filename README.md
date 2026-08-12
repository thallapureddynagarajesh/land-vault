# 🛡️ LandVault - Decentralized Blockchain Land Records & IPFS Document Management System

**LandVault** is a tamper-proof, transparent, and decentralized land records management platform built on the **Algorand Blockchain**, **AlgoKit**, **Python ARC-4 Smart Contracts**, **Pinata IPFS**, and **React**.

---

## 🌟 Key Architecture & Features

1. **Algorand Smart Contracts (Box Storage)**:
   - Records immutable land parcel titles (`property_id`, `owner`, `document_type`, `ipfs_cid`, `document_hash`, `location`, `timestamps`).
   - Zero-rent storage via Algorand AVM ARC-4 Box Storage.

2. **Decentralized IPFS Storage (Pinata)**:
   - Land deeds (PDFs, images, scanned records) are uploaded to **IPFS via Pinata**.
   - Includes a **Multi-Gateway Fallback Resolver** (`ipfs.io`, `cloudflare-ipfs.com`, `dweb.link`) to bypass Pinata shared public gateway restrictions (`ERR_ID:00023`).

3. **Client-Side AES-256-GCM Document Encryption & Privacy**:
   - Before uploading to IPFS, documents are encrypted in browser memory using **AES-256-GCM (Web Crypto API)**.
   - Files stored on IPFS are encrypted ciphertext payloads (`.enc`).
   - Only authorized parties (**Landowner**, **Buyer**, or **Government Registrar Authority**) can decrypt and view original documents in browser memory.

4. **Cryptographic Tamper Verification**:
   - Automated SHA-256 hash match against Algorand Box Storage. Any altered file triggers `🚨 DOCUMENT MISMATCH DETECTED`.

5. **Monetized x402 Payment Gateway**:
   - Integrated `HTTP 402 Payment Required` microtransaction gateway charging commercial third-party API clients & AI bots (`/api/v1/verify-deed`).

---

## 🚀 Quick Setup & Local Development

### Prerequisites
- Node.js (v18+) & Python (v3.12+)
- Docker (optional for LocalNet) & AlgoKit CLI

### Running the App
```bash
# 1. Navigate to frontend directory
cd projects/land_chain-frontend

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

### Running Smart Contract Unit Tests
```bash
cd projects/land_chain-contracts
poetry run pytest
```

---

## 🌐 Deploying to Vercel

LandVault is pre-configured for instant Vercel deployment:
- Configuration: [`projects/land_chain-frontend/vercel.json`](projects/land_chain-frontend/vercel.json)
- Full deployment guide: [`VERCEL_DEPLOYMENT_GUIDE.md`](VERCEL_DEPLOYMENT_GUIDE.md)

---

## 📁 Repository Structure

```text
land_chain/
├── projects/
│   ├── land_chain-contracts/      # Python ARC-4 Smart Contracts (Puya / AlgoPy)
│   │   ├── smart_contracts/land_contract/contract.py
│   │   └── tests/land_contract_test.py
│   │
│   └── land_chain-frontend/       # React + Vite + TypeScript Frontend DApp
│       ├── src/
│       │   ├── components/        # UploadLandDocument, LandRecordDetails, LandVerification...
│       │   ├── services/          # ipfs.ts, encryption.ts, x402Gateway.ts
│       │   ├── interfaces/        # land.ts
│       │   └── Home.tsx
│       └── vercel.json
│
├── VERCEL_DEPLOYMENT_GUIDE.md
└── README.md
```
