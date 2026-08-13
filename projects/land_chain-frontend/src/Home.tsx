import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'
import { Navbar } from './components/Navbar'
import { MetricsHeader } from './components/MetricsHeader'
import { LandVerification } from './components/LandVerification'
import { UploadLandDocument } from './components/UploadLandDocument'
import { LandMarketplace } from './components/LandMarketplace'
import { MyPortfolio } from './components/MyPortfolio'
import { GovernmentPortal } from './components/GovernmentPortal'
import { AuditTrailModal } from './components/AuditTrailModal'
import { LandChainFooter } from './components/LandChainFooter'
import ConnectWallet from './components/ConnectWallet'
import { AuditEvent, LandParcel } from './interfaces/land'

// Initial Seed Land Records with IPFS CIDs & Document Types
const initialParcels: LandParcel[] = [
  {
    parcelId: 'PRCL-2026-8801',
    location: 'Sector 14, Plot 88, Metro Financial District',
    areaSqft: 3500,
    propertyType: 'Residential',
    documentType: 'Sale Deed',
    owner: '58X7K2A9P3M8V1N4Q6R0T9W2Y5Z8B1C4D7E0F3G6H9J2',
    isApproved: true,
    isForSale: false,
    priceMicroAlgos: 0,
    ipfsCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    createdAt: 1770000000,
    lastTransferAt: 1770000000,
    transactionId: 'TX-8801-AVM-BOX-DEED',
  },
  {
    parcelId: 'PRCL-2026-9902',
    location: 'Block B, Innovation Tech Park, Silicon Bay',
    areaSqft: 12000,
    propertyType: 'Commercial',
    documentType: 'Title Deed',
    owner: '79Z1L8B3K4M9V2N5Q7R1T0W3Y6Z9B2C5D8E1F4G7H0J3',
    isApproved: true,
    isForSale: true,
    priceMicroAlgos: 450000000000, // 450,000 ALGO
    ipfsCid: 'QmZ3k9XyB8W7P2K1L5M4N3J6H7G8F9E0D1C2B3A4S5',
    documentHash: 'a8f931b74e2098b14c3562a129d891e4857b29a1482098319208319247192847',
    createdAt: 1770500000,
    lastTransferAt: 1770500000,
    transactionId: 'TX-9902-AVM-BOX-COMMERCIAL',
  },
  {
    parcelId: 'PRCL-2026-7703',
    location: 'Valley Green Acres, Plot 104, West District',
    areaSqft: 45000,
    propertyType: 'Agricultural',
    documentType: 'Ownership Certificate',
    owner: '23M4K8L9P1N5V3Q7R2T1W4Y7Z0B3C6D9E2F5G8H1J4K7',
    isApproved: true,
    isForSale: true,
    priceMicroAlgos: 120000000000, // 120,000 ALGO
    ipfsCid: 'QmY1x2Z3W4V5U6T7S8R9Q0P1O2N3M4L5K6J7I8H9',
    documentHash: 'c72b812049812049812049812049812049812049812049812049812049812049',
    createdAt: 1771000000,
    lastTransferAt: 1771000000,
    transactionId: 'TX-7703-AVM-BOX-FARM',
  },
  {
    parcelId: 'PRCL-2026-6604',
    location: 'Logistics Hub 9, Freight Corridor Port',
    areaSqft: 85000,
    propertyType: 'Industrial',
    documentType: 'Registration Certificate',
    owner: '99A8B7C6D5E4F3G2H1J0K9L8M7N6P5Q4R3S2T1U0V9W8',
    isApproved: false,
    isForSale: false,
    priceMicroAlgos: 0,
    ipfsCid: 'QmK9J8I7H6G5F4E3D2C1B0A9Z8Y7X6W5V4U3T2S1',
    documentHash: 'd41d8cd98f00b204e9800998ecf8427e90000000000000000000000000000000',
    createdAt: 1771500000,
    lastTransferAt: 1771500000,
    transactionId: 'TX-6604-AVM-BOX-PORT',
  },
]

// Initial Provenance Audit Events
const initialAuditEvents: AuditEvent[] = [
  {
    id: 'evt-1',
    parcelId: 'PRCL-2026-8801',
    eventType: 'REGISTRATION',
    toAddress: '58X7K2A9P3M8V1N4Q6R0T9W2Y5Z8B1C4D7E0F3G6H9J2',
    timestamp: 1770000000,
    blockRound: 39104012,
    txHash: '2K9X4M7P8Q1V3N5R0T9W2Y5Z8B1C4D7E0F3G6H9J2K1L',
  },
  {
    id: 'evt-2',
    parcelId: 'PRCL-2026-8801',
    eventType: 'GOV_APPROVAL',
    fromAddress: 'GOV_ADMIN_AUTHORITY_KEY_ALGORAND_OFFICIAL',
    timestamp: 1770000500,
    blockRound: 39104115,
    txHash: '7R1T0W3Y6Z9B2C5D8E1F4G7H0J3K6L9M2N5P8Q1V4N7',
  },
  {
    id: 'evt-3',
    parcelId: 'PRCL-2026-9902',
    eventType: 'REGISTRATION',
    toAddress: '79Z1L8B3K4M9V2N5Q7R1T0W3Y6Z9B2C5D8E1F4G7H0J3',
    timestamp: 1770500000,
    blockRound: 39115000,
    txHash: '9Z0B3C6D9E2F5G8H1J4K7L0M3N6P9Q2R5T8W1Y4Z7B0',
  },
  {
    id: 'evt-4',
    parcelId: 'PRCL-2026-9902',
    eventType: 'GOV_APPROVAL',
    fromAddress: 'GOV_ADMIN_AUTHORITY_KEY_ALGORAND_OFFICIAL',
    timestamp: 1770500300,
    blockRound: 39115080,
    txHash: '4F3G2H1J0K9L8M7N6P5Q4R3S2T1U0V9W8X7Y6Z5A4B3',
  },
  {
    id: 'evt-5',
    parcelId: 'PRCL-2026-9902',
    eventType: 'LISTED_FOR_SALE',
    fromAddress: '79Z1L8B3K4M9V2N5Q7R1T0W3Y6Z9B2C5D8E1F4G7H0J3',
    priceAlgos: 450000,
    timestamp: 1770501000,
    blockRound: 39115320,
    txHash: '1K2L3M4N5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2',
  },
  {
    id: 'evt-6',
    parcelId: 'PRCL-2026-7703',
    eventType: 'REGISTRATION',
    toAddress: '23M4K8L9P1N5V3Q7R2T1W4Y7Z0B3C6D9E2F5G8H1J4K7',
    timestamp: 1771000000,
    blockRound: 39126000,
    txHash: '3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0P1Q2R3S4',
  },
  {
    id: 'evt-7',
    parcelId: 'PRCL-2026-7703',
    eventType: 'LISTED_FOR_SALE',
    fromAddress: '23M4K8L9P1N5V3Q7R2T1W4Y7Z0B3C6D9E2F5G8H1J4K7',
    priceAlgos: 120000,
    timestamp: 1771000500,
    blockRound: 39126150,
    txHash: '8M9N0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9',
  },
  {
    id: 'evt-8',
    parcelId: 'PRCL-2026-6604',
    eventType: 'REGISTRATION',
    toAddress: '99A8B7C6D5E4F3G2H1J0K9L8M7N6P5Q4R3S2T1U0V9W8',
    timestamp: 1771500000,
    blockRound: 39138000,
    txHash: '5E6F7G8H9I0J1K2L3M4N5P6Q7R8S9T0U1V2W3X4Y5Z6',
  },
]

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'upload' | 'marketplace' | 'portfolio' | 'government'>('search')
  const [userRole, setUserRole] = useState<'citizen' | 'registrar' | 'investor'>('citizen')
  const [parcels, setParcels] = useState<LandParcel[]>(initialParcels)
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(initialAuditEvents)
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [auditModalParcelId, setAuditModalParcelId] = useState<string | null>(null)

  const { activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  // Helper generator for realistic pseudo-txHash
  const generateTxHash = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let res = ''
    for (let i = 0; i < 44; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return res
  }

  // Calculate high-level system metrics
  const totalParcels = parcels.length
  const verifiedCount = parcels.filter((p) => p.isApproved).length
  const activeListings = parcels.filter((p) => p.isForSale)
  const activeListingsCount = activeListings.length
  const totalVolumeAlgos = activeListings.reduce((sum, p) => sum + p.priceMicroAlgos / 1e6, 0)

  // 1. Issue / Register New Land Parcel (with IPFS CID & SHA-256 Hash)
  const handleRegisterLand = (
    newParcelData: Omit<LandParcel, 'isApproved' | 'isForSale' | 'priceMicroAlgos' | 'createdAt' | 'lastTransferAt'>
  ) => {
    const now = Math.floor(Date.now() / 1000)
    const newParcel: LandParcel = {
      ...newParcelData,
      documentType: newParcelData.documentType || 'Sale Deed',
      ipfsCid: newParcelData.ipfsCid || 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      isApproved: true, // Authority issued title is auto-authenticated
      isForSale: false,
      priceMicroAlgos: 0,
      createdAt: now,
      lastTransferAt: now,
      transactionId: newParcelData.transactionId || `TX-${Date.now()}-BOX-REG`,
    }

    setParcels((prev) => [newParcel, ...prev])

    // Add Audit Log
    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      parcelId: newParcel.parcelId,
      eventType: 'REGISTRATION',
      toAddress: newParcel.owner,
      timestamp: now,
      blockRound: 39140000 + Math.floor(Math.random() * 500),
      txHash: newParcel.transactionId || generateTxHash(),
    }
    setAuditEvents((prev) => [newEvent, ...prev])

    enqueueSnackbar(`Land Parcel ${newParcel.parcelId} registered on IPFS & Algorand Box Storage!`, { variant: 'success' })
  }

  // 2. Approve Pending Land Title
  const handleApproveLand = (parcelId: string) => {
    const now = Math.floor(Date.now() / 1000)
    setParcels((prev) =>
      prev.map((p) => (p.parcelId === parcelId ? { ...p, isApproved: true } : p))
    )

    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      parcelId,
      eventType: 'GOV_APPROVAL',
      fromAddress: activeAddress || 'GOV_ADMIN_AUTHORITY_KEY_ALGORAND_OFFICIAL',
      timestamp: now,
      blockRound: 39140000 + Math.floor(Math.random() * 500),
      txHash: generateTxHash(),
    }
    setAuditEvents((prev) => [newEvent, ...prev])

    enqueueSnackbar(`Parcel ${parcelId} deed authenticated by Government Registrar!`, { variant: 'success' })
  }

  // 3. List Property For Sale
  const handleListForSale = (parcelId: string, priceAlgos: number) => {
    const priceMicroAlgos = priceAlgos * 1e6
    const targetParcel = parcels.find((p) => p.parcelId === parcelId)

    setParcels((prev) =>
      prev.map((p) =>
        p.parcelId === parcelId ? { ...p, isForSale: true, priceMicroAlgos } : p
      )
    )

    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      parcelId,
      eventType: 'LISTED_FOR_SALE',
      fromAddress: targetParcel?.owner || activeAddress || 'LAND_OWNER_KEY',
      priceAlgos,
      timestamp: Math.floor(Date.now() / 1000),
      blockRound: 39140000 + Math.floor(Math.random() * 500),
      txHash: generateTxHash(),
    }
    setAuditEvents((prev) => [newEvent, ...prev])

    enqueueSnackbar(`Parcel ${parcelId} listed for sale at ${priceAlgos.toLocaleString()} ALGO!`, { variant: 'info' })
  }

  // 4. Delist Property
  const handleDelistLand = (parcelId: string) => {
    setParcels((prev) =>
      prev.map((p) =>
        p.parcelId === parcelId ? { ...p, isForSale: false, priceMicroAlgos: 0 } : p
      )
    )

    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      parcelId,
      eventType: 'DELISTED',
      fromAddress: activeAddress || 'LAND_OWNER_KEY',
      timestamp: Math.floor(Date.now() / 1000),
      blockRound: 39140000 + Math.floor(Math.random() * 500),
      txHash: generateTxHash(),
    }
    setAuditEvents((prev) => [newEvent, ...prev])

    enqueueSnackbar(`Parcel ${parcelId} delisted from marketplace`, { variant: 'default' })
  }

  // 5. Buy Land (Atomic Transaction Flow)
  const handleBuyLand = (parcelId: string, priceAlgos: number, sellerAddress: string) => {
    const buyerAddress = activeAddress || 'BUYER_WALLET_ALGORAND_MAINNET_ADDRESS_KEY'
    const now = Math.floor(Date.now() / 1000)

    setParcels((prev) =>
      prev.map((p) =>
        p.parcelId === parcelId
          ? { ...p, owner: buyerAddress, isForSale: false, priceMicroAlgos: 0, lastTransferAt: now }
          : p
      )
    )

    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      parcelId,
      eventType: 'PURCHASE',
      fromAddress: sellerAddress,
      toAddress: buyerAddress,
      priceAlgos,
      timestamp: now,
      blockRound: 39140000 + Math.floor(Math.random() * 500),
      txHash: generateTxHash(),
    }
    setAuditEvents((prev) => [newEvent, ...prev])

    enqueueSnackbar(`Congratulations! You purchased ${parcelId} for ${priceAlgos.toLocaleString()} ALGO!`, {
      variant: 'success',
    })
  }

  // 6. Direct Ownership Transfer
  const handleTransferOwnership = (parcelId: string, recipientAddress: string) => {
    const targetParcel = parcels.find((p) => p.parcelId === parcelId)
    const now = Math.floor(Date.now() / 1000)

    setParcels((prev) =>
      prev.map((p) =>
        p.parcelId === parcelId
          ? { ...p, owner: recipientAddress, isForSale: false, priceMicroAlgos: 0, lastTransferAt: now }
          : p
      )
    )

    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      parcelId,
      eventType: 'OWNERSHIP_TRANSFER',
      fromAddress: targetParcel?.owner || activeAddress || 'PREVIOUS_OWNER_KEY',
      toAddress: recipientAddress,
      timestamp: now,
      blockRound: 39140000 + Math.floor(Math.random() * 500),
      txHash: generateTxHash(),
    }
    setAuditEvents((prev) => [newEvent, ...prev])

    enqueueSnackbar(`Title Deed ${parcelId} transferred to ${recipientAddress.slice(0, 6)}...!`, {
      variant: 'success',
    })
  }

  // Find parcel selected for audit trail modal
  const selectedAuditParcel = parcels.find((p) => p.parcelId === auditModalParcelId) || null

  const handleDeleteLand = (parcelId: string) => {
    setParcels((prev) => prev.filter((p) => p.parcelId !== parcelId))
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        connectedAddress={activeAddress}
        onConnectWalletClick={() => setOpenWalletModal(true)}
      />

      {/* Main Body Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Top Summary Metrics */}
        <MetricsHeader
          totalParcels={totalParcels}
          verifiedCount={verifiedCount}
          activeListingsCount={activeListingsCount}
          totalVolumeAlgos={totalVolumeAlgos}
        />

        {/* Tab View Routing */}
        {activeTab === 'search' && (
          <LandVerification
            parcels={parcels}
            onOpenAuditTrail={(parcelId) => setAuditModalParcelId(parcelId)}
            onRegisterLand={handleRegisterLand}
            onDeleteLand={handleDeleteLand}
            connectedAddress={activeAddress}
            userRole={userRole}
          />
        )}

        {activeTab === 'upload' && (
          <UploadLandDocument
            onRegisterLand={handleRegisterLand}
            connectedAddress={activeAddress}
            onSuccessNavigate={() => setActiveTab('search')}
          />
        )}

        {activeTab === 'marketplace' && (
          <LandMarketplace
            parcels={parcels}
            onBuyLand={handleBuyLand}
            onDelistLand={handleDelistLand}
            onOpenAuditTrail={(parcelId) => setAuditModalParcelId(parcelId)}
            connectedAddress={activeAddress}
          />
        )}

        {activeTab === 'portfolio' && (
          <MyPortfolio
            parcels={parcels}
            connectedAddress={activeAddress}
            onListForSale={handleListForSale}
            onDelistLand={handleDelistLand}
            onTransferOwnership={handleTransferOwnership}
            onDeleteLand={handleDeleteLand}
            onOpenAuditTrail={(parcelId) => setAuditModalParcelId(parcelId)}
          />
        )}

        {activeTab === 'government' && (
          <GovernmentPortal
            parcels={parcels}
            onRegisterLand={handleRegisterLand}
            onApproveLand={handleApproveLand}
            connectedAddress={activeAddress}
          />
        )}
      </main>

      {/* Audit Trail Modal */}
      <AuditTrailModal
        parcel={selectedAuditParcel}
        auditEvents={auditEvents}
        onClose={() => setAuditModalParcelId(null)}
      />

      {/* Wallet Connection Modal */}
      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />

      {/* Footer */}
      <LandChainFooter />
    </div>
  )
}

export default Home
