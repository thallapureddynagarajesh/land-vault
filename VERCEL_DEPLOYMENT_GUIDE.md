# 🚀 LandVault Vercel Deployment Guide

Deploy your **LandVault** project to **Vercel** to get a live, secure HTTPS web URL (e.g., `https://landvault.vercel.app`) accessible from anywhere in the world on Google Chrome, Safari, mobile devices, and tablets!

---

## 🛠️ Step 1: Pre-Configured Files Created

We have already created the required configuration file in your project:
- [`projects/land_chain-frontend/vercel.json`](file:///c:/algokit/landvault/land_chain/projects/land_chain-frontend/vercel.json)

---

## 🌐 Step 2: Deploying via Vercel Dashboard (Method 1 - Recommended)

1. Push your project code to a **GitHub**, **GitLab**, or **Bitbucket** repository.
2. Log in to [vercel.com](https://vercel.com/) and click **Add New** → **Project**.
3. Import your LandVault repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `projects/land_chain-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add the following keys:

```env
VITE_ENVIRONMENT=production
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=
VITE_ALGOD_TOKEN=
VITE_ALGOD_NETWORK=testnet

VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
VITE_INDEXER_PORT=
VITE_INDEXER_TOKEN=

VITE_PINATA_JWT=your_pinata_jwt_token_here
VITE_PINATA_GATEWAY_URL=https://ipfs.io/ipfs/
```

6. Click **Deploy**. In under 1 minute, Vercel will build and launch your live URL!

---

## ⚡ Step 3: Deploying via Vercel CLI (Method 2 - Direct Terminal Deployment)

Alternatively, you can deploy directly from your terminal:

```bash
cd projects/land_chain-frontend
npx vercel
```

Follow the prompts:
- **Set up and deploy?**: `y`
- **Which scope?**: Choose your personal/team account
- **Link to existing project?**: `n`
- **What's your project's name?**: `landvault`
- **In which directory is your code located?**: `./`
- **Want to modify settings?**: `n`

Once finished, run:
```bash
npx vercel --prod
```

---

## 🔒 Why Deploying on Vercel Works Seamlessly

1. **Global Algorand TestNet/MainNet RPC**:
   The deployed app connects to public AlgoNode RPC endpoints (`https://testnet-api.algonode.cloud`), so users can connect Pera Wallet, Defly Wallet, or Kibisis Wallet from their phones or laptops anywhere in the world!

2. **Decentralized IPFS Access**:
   IPFS document uploads and AES-256-GCM decryptions execute directly in browser memory on the client side, requiring zero server maintenance.

3. **Instant Live Web Link**:
   Vercel provides a free SSL certificate (`https://landvault.vercel.app`) with custom domain support!
