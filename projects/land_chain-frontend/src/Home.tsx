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
    surveyNumber: 'SURVEY-8801/A',
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
    status: 'VERIFIED',
    verifiedBy: 'GOV_REGISTRAR_REGISTRY_OFFICIAL_KEY',
    verificationTimestamp: 1770000500,
    transferCount: 0,
    ownershipHistory: [
      {
        previousOwner: 'INITIAL_GOV_LAND_GRANT',
        newOwner: '58X7K2A9P3M8V1N4Q6R0T9W2Y5Z8B1C4D7E0F3G6H9J2',
        timestamp: 1770000000,
        transactionId: 'TX-8801-AVM-BOX-DEED',
      },
    ],
  },
  {
    parcelId: 'PRCL-2026-9902',
    surveyNumber: 'SURVEY-9902/B',
    location: 'Block B, Innovation Tech Park, Silicon Bay',
    areaSqft: 12000,
    propertyType: 'Commercial',
    documentType: 'Title Deed',
    owner: '79Z1L8B3K4M9V2N5Q7R1T0W3Y6Z9B2C5D8E1F4G7H0J3',
    isApproved: true,
    isForSale: true,
    priceMicroAlgos: 10000000, // 10 ALGO
    ipfsCid: 'QmZ3k9XyB8W7P2K1L5M4N3J6H7G8F9E0D1C2B3A4S5',
    documentHash: 'a8f931b74e2098b14c3562a129d891e4857b29a1482098319208319247192847',
    createdAt: 1770500000,
    lastTransferAt: 1770500000,
    transactionId: 'TX-9902-AVM-BOX-COMMERCIAL',
    status: 'VERIFIED',
    verifiedBy: 'GOV_REGISTRAR_REGISTRY_OFFICIAL_KEY',
    verificationTimestamp: 1770500500,
    transferCount: 1,
    ownershipHistory: [
      {
        previousOwner: 'DEVELOPER_CORP_KEY',
        newOwner: '79Z1L8B3K4M9V2N5Q7R1T0W3Y6Z9B2C5D8E1F4G7H0J3',
        timestamp: 1770500000,
        transactionId: 'TX-9902-AVM-BOX-COMMERCIAL',
      },
    ],
  },
  {
    parcelId: 'PRCL-2026-7703',
    surveyNumber: 'SURVEY-7703/C',
    location: 'Valley Green Acres, Plot 104, West District',
    areaSqft: 45000,
    propertyType: 'Agricultural',
    documentType: 'Ownership Certificate',
    owner: '23M4K8L9P1N5V3Q7R2T1W4Y7Z0B3C6D9E2F5G8H1J4K7',
    isApproved: true,
    isForSale: true,
    priceMicroAlgos: 10000000, // 10 ALGO
    ipfsCid: 'QmY1x2Z3W4V5U6T7S8R9Q0P1O2N3M4L5K6J7I8H9',
    documentHash: 'c72b812049812049812049812049812049812049812049812049812049812049',
    createdAt: 1771000000,
    lastTransferAt: 1771000000,
    transactionId: 'TX-7703-AVM-BOX-FARM',
    status: 'VERIFIED',
    verifiedBy: 'GOV_REGISTRAR_REGISTRY_OFFICIAL_KEY',
    verificationTimestamp: 1771000500,
    transferCount: 0,
  },
  {
    parcelId: 'PRCL-2026-6604',
    surveyNumber: 'SURVEY-6604/D',
    location: 'Logistics Hub 9, Freight Corridor Port',
    areaSqft: 85000,
    propertyType: 'Industrial',
    documentType: 'Registration Certificate',
    owner: 'XC7L7DOGVARDIIZWIWPWC7KINFRJZHMPNQZQGEMUFU5XLJXYJKNQPY3UM4',
    isApproved: false,
    isForSale: false,
    priceMicroAlgos: 0,
    ipfsCid: 'QmK9J8I7H6G5F4E3D2C1B0A9Z8Y7X6W5V4U3T2S1',
    documentHash: 'd41d8cd98f00b204e9800998ecf8427e90000000000000000000000000000000',
    createdAt: 1771500000,
    lastTransferAt: 1771500000,
    transactionId: 'TX-6604-AVM-BOX-PORT',
    status: 'PENDING',
    transferCount: 0,
  },
  {
    parcelId: 'PRCL-2026-5505',
    surveyNumber: 'SURVEY-5505/E',
    location: 'Hilltop View Estate, Plot 12',
    areaSqft: 2800,
    propertyType: 'Residential',
    documentType: 'Title Deed',
    owner: '99A8B7C6D5E4F3G2H1J0K9L8M7N6P5Q4R3S2T1U0V9W8',
    isApproved: false,
    isForSale: false,
    priceMicroAlgos: 0,
    ipfsCid: 'QmHilltopHash123CID',
    documentHash: 'e41d8cd98f00b204e9800998ecf8427e90000000000000000000000000000000',
    createdAt: 1771600000,
    lastTransferAt: 1771600000,
    transactionId: 'TX-5505-AVM-BOX-HILLTOP',
    status: 'REJECTED',
    verifiedBy: 'GOV_REGISTRAR_REGISTRY_OFFICIAL_KEY',
    verificationTimestamp: 1771600500,
    rejectionReason: 'Mismatched boundary survey plot map. Please re-upload certified land survey deed.',
    transferCount: 0,
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
    blockRound: 39104100,
    txHash: '9Z1L8B3K4M9V2N5Q7R1T0W3Y6Z9B2C5D8E1F4G7H0J3K',
  },
]

export const Home: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()
  const { activeAddress } = useWallet()

  // Primary State
  const [parcels, setParcels] = useState<LandParcel[]>(initialParcels)
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(initialAuditEvents)
  const [activeTab, setActiveTab] = useState<'search' | 'upload' | 'marketplace' | 'portfolio' | 'government'>('search')
  const [userRole, setUserRole] = useState<'citizen' | 'registrar' | 'investor'>('citizen')
  const [auditModalParcelId, setAuditModalParcelId] = useState<string | null>(null)
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('')

  // Generate mock Algorand transaction hash
  const generateTxHash = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let res = ''
    for (let i = 0; i < 52; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return res
  }

  // Calculate high-level system metrics
  const totalParcels = parcels.length
  const verifiedCount = parcels.filter((p) => p.status === 'VERIFIED').length
  const activeListings = parcels.filter((p) => p.isForSale && p.status === 'VERIFIED')
  const activeListingsCount = activeListings.length
  const totalVolumeAlgos = activeListings.reduce((sum, p) => sum + p.priceMicroAlgos / 1e6, 0)

  // 1. Issue / Register New Land Parcel (status starts as PENDING)
  const handleRegisterLand = (
    newParcelData: Omit<LandParcel, 'isApproved' | 'isForSale' | 'priceMicroAlgos' | 'createdAt' | 'lastTransferAt'>
  ) => {
    const now = Math.floor(Date.now() / 1000)
    const newParcel: LandParcel = {
      ...newParcelData,
      surveyNumber: newParcelData.surveyNumber || `SURVEY-${newParcelData.parcelId}`,
      documentType: newParcelData.documentType || 'Sale Deed',
      ipfsCid: newParcelData.ipfsCid || 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      status: 'PENDING',
      isApproved: false,
      isForSale: false,
      priceMicroAlgos: 0,
      createdAt: now,
      lastTransferAt: now,
      transactionId: newParcelData.transactionId || `TX-${Date.now()}-BOX-REG`,
      transferCount: 0,
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

    enqueueSnackbar(`Land Parcel ${newParcel.parcelId} submitted! Status: PENDING VERIFICATION`, { variant: 'warning' })
  }

  // 2. Approve Pending Land Title
  const handleApproveLand = (parcelId: string) => {
    const now = Math.floor(Date.now() / 1000)
    const registrarAddr = activeAddress || 'GOV_REGISTRAR_REGISTRY_OFFICIAL_KEY'
    setParcels((prev) =>
      prev.map((p) =>
        p.parcelId === parcelId
          ? {
              ...p,
              status: 'VERIFIED',
              isApproved: true,
              verifiedBy: registrarAddr,
              verificationTimestamp: now,
              rejectionReason: '',
            }
          : p
      )
    )

    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      parcelId,
      eventType: 'GOV_APPROVAL',
      fromAddress: registrarAddr,
      timestamp: now,
      blockRound: 39140000 + Math.floor(Math.random() * 500),
      txHash: generateTxHash(),
    }
    setAuditEvents((prev) => [newEvent, ...prev])

    enqueueSnackbar(`Parcel ${parcelId} deed APPROVED & VERIFIED by Registrar on Algorand!`, { variant: 'success' })
  }

  // 3. Reject Pending Land Title
  const handleRejectLand = (parcelId: string, reason: string) => {
    const now = Math.floor(Date.now() / 1000)
    const registrarAddr = activeAddress || 'GOV_REGISTRAR_REGISTRY_OFFICIAL_KEY'
    setParcels((prev) =>
      prev.map((p) =>
        p.parcelId === parcelId
          ? {
              ...p,
              status: 'REJECTED',
              isApproved: false,
              verifiedBy: registrarAddr,
              verificationTimestamp: now,
              rejectionReason: reason,
            }
          : p
      )
    )

    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      parcelId,
      eventType: 'GOV_APPROVAL',
      fromAddress: registrarAddr,
      timestamp: now,
      blockRound: 39140000 + Math.floor(Math.random() * 500),
      txHash: generateTxHash(),
    }
    setAuditEvents((prev) => [newEvent, ...prev])

    enqueueSnackbar(`Parcel ${parcelId} registration REJECTED with recorded reason.`, { variant: 'error' })
  }

  // 4. List Property For Sale (Only VERIFIED)
  const handleListForSale = (parcelId: string, priceAlgos: number) => {
    const targetParcel = parcels.find((p) => p.parcelId === parcelId)
    if (targetParcel && targetParcel.status !== 'VERIFIED') {
      enqueueSnackbar('ERROR: Ownership transfer / marketplace listing is allowed only for VERIFIED land records.', { variant: 'error' })
      return
    }

    const priceMicroAlgos = priceAlgos * 1e6

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

  // 5. Delist Property
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

  // 6. Buy Land (Atomic Transaction Flow)
  const handleBuyLand = (parcelId: string, priceAlgos: number, sellerAddress: string) => {
    const targetParcel = parcels.find((p) => p.parcelId === parcelId)
    if (targetParcel && targetParcel.status !== 'VERIFIED') {
      enqueueSnackbar('ERROR: Ownership transfer is allowed only for VERIFIED land records.', { variant: 'error' })
      return
    }

    const buyerAddress = activeAddress || 'BUYER_WALLET_ALGORAND_MAINNET_ADDRESS_KEY'
    const now = Math.floor(Date.now() / 1000)

    setParcels((prev) =>
      prev.map((p) => {
        if (p.parcelId !== parcelId) return p
        const history = p.ownershipHistory || []
        return {
          ...p,
          owner: buyerAddress,
          isForSale: false,
          priceMicroAlgos: 0,
          lastTransferAt: now,
          transferCount: (p.transferCount || 0) + 1,
          ownershipHistory: [
            ...history,
            {
              previousOwner: sellerAddress,
              newOwner: buyerAddress,
              timestamp: now,
              transactionId: `TX-BUY-${Date.now()}`,
            },
          ],
        }
      })
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

  // 7. Direct Ownership Transfer
  const handleTransferOwnership = (parcelId: string, recipientAddress: string) => {
    const targetParcel = parcels.find((p) => p.parcelId === parcelId)
    if (targetParcel && targetParcel.status !== 'VERIFIED') {
      enqueueSnackbar('ERROR: Ownership transfer is allowed only for VERIFIED land records.', { variant: 'error' })
      return
    }

    const now = Math.floor(Date.now() / 1000)
    const prevOwner = targetParcel?.owner || activeAddress || 'PREVIOUS_OWNER_KEY'

    setParcels((prev) =>
      prev.map((p) => {
        if (p.parcelId !== parcelId) return p
        const history = p.ownershipHistory || []
        return {
          ...p,
          owner: recipientAddress,
          isForSale: false,
          priceMicroAlgos: 0,
          lastTransferAt: now,
          transferCount: (p.transferCount || 0) + 1,
          ownershipHistory: [
            ...history,
            {
              previousOwner: prevOwner,
              newOwner: recipientAddress,
              timestamp: now,
              transactionId: `TX-XFER-${Date.now()}`,
            },
          ],
        }
      })
    )

    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      parcelId,
      eventType: 'OWNERSHIP_TRANSFER',
      fromAddress: prevOwner,
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
        searchQuery={globalSearchQuery}
        onSearchChange={(q) => setGlobalSearchQuery(q)}
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
            onConnectWalletClick={() => setOpenWalletModal(true)}
            externalSearchQuery={globalSearchQuery}
          />
        )}

        {activeTab === 'upload' && (
          <UploadLandDocument
            onRegisterLand={handleRegisterLand}
            connectedAddress={activeAddress}
            onSuccessNavigate={() => setActiveTab('search')}
            onConnectWalletClick={() => setOpenWalletModal(true)}
          />
        )}

        {activeTab === 'marketplace' && (
          <LandMarketplace
            parcels={parcels.filter((p) => p.status === 'VERIFIED')}
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
            onRejectLand={handleRejectLand}
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
