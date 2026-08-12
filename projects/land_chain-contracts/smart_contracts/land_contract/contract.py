from algopy import (
    ARC4Contract,
    Account,
    BoxMap,
    Global,
    GlobalState,
    String,
    Txn,
    UInt64,
    arc4,
    gtxn,
)


class LandRecord(arc4.Struct):
    parcel_id: arc4.String
    location: arc4.String
    area_sqft: arc4.UInt64
    property_type: arc4.String
    document_type: arc4.String
    owner: arc4.Address
    is_approved: arc4.Bool
    is_for_sale: arc4.Bool
    price_microalgos: arc4.UInt64
    ipfs_cid: arc4.String
    document_hash: arc4.String
    created_at: arc4.UInt64
    last_transfer_at: arc4.UInt64


class LandContract(ARC4Contract):
    def __init__(self) -> None:
        self.admin = GlobalState(Account)
        self.parcels = BoxMap(String, LandRecord)

    @arc4.abimethod(create="require")
    def create_application(self) -> None:
        self.admin.value = Txn.sender

    @arc4.abimethod()
    def get_admin(self) -> Account:
        return self.admin.value

    @arc4.abimethod()
    def set_admin(self, new_admin: Account) -> None:
        assert Txn.sender == self.admin.value, "Only admin can set new admin"
        self.admin.value = new_admin

    @arc4.abimethod()
    def register_land(
        self,
        parcel_id: String,
        location: String,
        area_sqft: UInt64,
        property_type: String,
        document_type: String,
        owner: Account,
        ipfs_cid: String,
        document_hash: String,
    ) -> None:
        assert Txn.sender == self.admin.value, "Only admin can register land"
        assert parcel_id not in self.parcels, "Parcel ID already registered"

        now = Global.latest_timestamp
        record = LandRecord(
            parcel_id=arc4.String(parcel_id),
            location=arc4.String(location),
            area_sqft=arc4.UInt64(area_sqft),
            property_type=arc4.String(property_type),
            document_type=arc4.String(document_type),
            owner=arc4.Address(owner),
            is_approved=arc4.Bool(True),
            is_for_sale=arc4.Bool(False),
            price_microalgos=arc4.UInt64(0),
            ipfs_cid=arc4.String(ipfs_cid),
            document_hash=arc4.String(document_hash),
            created_at=arc4.UInt64(now),
            last_transfer_at=arc4.UInt64(now),
        )
        self.parcels[parcel_id] = record.copy()

    @arc4.abimethod()
    def approve_land(self, parcel_id: String) -> None:
        assert Txn.sender == self.admin.value, "Only admin can approve land"
        assert parcel_id in self.parcels, "Parcel ID does not exist"

        record = self.parcels[parcel_id].copy()
        updated_record = LandRecord(
            parcel_id=record.parcel_id,
            location=record.location,
            area_sqft=record.area_sqft,
            property_type=record.property_type,
            document_type=record.document_type,
            owner=record.owner,
            is_approved=arc4.Bool(True),
            is_for_sale=record.is_for_sale,
            price_microalgos=record.price_microalgos,
            ipfs_cid=record.ipfs_cid,
            document_hash=record.document_hash,
            created_at=record.created_at,
            last_transfer_at=record.last_transfer_at,
        )
        self.parcels[parcel_id] = updated_record.copy()

    @arc4.abimethod()
    def list_for_sale(self, parcel_id: String, price_microalgos: UInt64) -> None:
        assert parcel_id in self.parcels, "Parcel ID does not exist"
        record = self.parcels[parcel_id].copy()
        assert (
            arc4.Address(Txn.sender) == record.owner
        ), "Only land owner can list land for sale"
        assert bool(record.is_approved), "Land must be government approved before listing"
        assert price_microalgos > 0, "Price must be greater than zero"

        updated_record = LandRecord(
            parcel_id=record.parcel_id,
            location=record.location,
            area_sqft=record.area_sqft,
            property_type=record.property_type,
            document_type=record.document_type,
            owner=record.owner,
            is_approved=record.is_approved,
            is_for_sale=arc4.Bool(True),
            price_microalgos=arc4.UInt64(price_microalgos),
            ipfs_cid=record.ipfs_cid,
            document_hash=record.document_hash,
            created_at=record.created_at,
            last_transfer_at=record.last_transfer_at,
        )
        self.parcels[parcel_id] = updated_record.copy()

    @arc4.abimethod()
    def delist_land(self, parcel_id: String) -> None:
        assert parcel_id in self.parcels, "Parcel ID does not exist"
        record = self.parcels[parcel_id].copy()
        assert (
            arc4.Address(Txn.sender) == record.owner or Txn.sender == self.admin.value
        ), "Only owner or admin can delist land"

        updated_record = LandRecord(
            parcel_id=record.parcel_id,
            location=record.location,
            area_sqft=record.area_sqft,
            property_type=record.property_type,
            document_type=record.document_type,
            owner=record.owner,
            is_approved=record.is_approved,
            is_for_sale=arc4.Bool(False),
            price_microalgos=arc4.UInt64(0),
            ipfs_cid=record.ipfs_cid,
            document_hash=record.document_hash,
            created_at=record.created_at,
            last_transfer_at=record.last_transfer_at,
        )
        self.parcels[parcel_id] = updated_record.copy()

    @arc4.abimethod()
    def transfer_ownership(self, parcel_id: String, new_owner: Account) -> None:
        assert parcel_id in self.parcels, "Parcel ID does not exist"
        record = self.parcels[parcel_id].copy()
        assert (
            arc4.Address(Txn.sender) == record.owner or Txn.sender == self.admin.value
        ), "Only current owner or admin can transfer ownership"

        now = Global.latest_timestamp
        updated_record = LandRecord(
            parcel_id=record.parcel_id,
            location=record.location,
            area_sqft=record.area_sqft,
            property_type=record.property_type,
            document_type=record.document_type,
            owner=arc4.Address(new_owner),
            is_approved=record.is_approved,
            is_for_sale=arc4.Bool(False),
            price_microalgos=arc4.UInt64(0),
            ipfs_cid=record.ipfs_cid,
            document_hash=record.document_hash,
            created_at=record.created_at,
            last_transfer_at=arc4.UInt64(now),
        )
        self.parcels[parcel_id] = updated_record.copy()

    @arc4.abimethod()
    def buy_land(self, parcel_id: String, pay_txn: gtxn.PaymentTransaction) -> None:
        assert parcel_id in self.parcels, "Parcel ID does not exist"
        record = self.parcels[parcel_id].copy()
        assert bool(record.is_for_sale), "Parcel is not for sale"

        price = record.price_microalgos.as_uint64()

        assert pay_txn.sender == Txn.sender, "Payment sender must match caller"
        assert arc4.Address(pay_txn.receiver) == record.owner, "Payment receiver must be land owner"
        assert pay_txn.amount >= price, "Payment amount is insufficient"

        now = Global.latest_timestamp
        updated_record = LandRecord(
            parcel_id=record.parcel_id,
            location=record.location,
            area_sqft=record.area_sqft,
            property_type=record.property_type,
            document_type=record.document_type,
            owner=arc4.Address(Txn.sender),
            is_approved=record.is_approved,
            is_for_sale=arc4.Bool(False),
            price_microalgos=arc4.UInt64(0),
            ipfs_cid=record.ipfs_cid,
            document_hash=record.document_hash,
            created_at=record.created_at,
            last_transfer_at=arc4.UInt64(now),
        )
        self.parcels[parcel_id] = updated_record.copy()

    @arc4.abimethod(readonly=True)
    def get_land(self, parcel_id: String) -> LandRecord:
        assert parcel_id in self.parcels, "Parcel ID does not exist"
        return self.parcels[parcel_id].copy()

    @arc4.abimethod(readonly=True)
    def is_land_registered(self, parcel_id: String) -> bool:
        return parcel_id in self.parcels
