from collections.abc import Iterator

import pytest
from algopy import String, UInt64, arc4
from algopy_testing import AlgopyTestContext, algopy_testing_context

from smart_contracts.land_contract.contract import LandContract


@pytest.fixture()
def context() -> Iterator[AlgopyTestContext]:
    with algopy_testing_context() as ctx:
        yield ctx


def test_create_application_and_admin(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    assert contract.get_admin() == admin_account


def test_register_land(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    owner_account = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    parcel_id = String("PRCL-101")
    location = String("Zone A, Plot 42")
    area_sqft = UInt64(2500)
    property_type = String("Residential")
    document_type = String("Sale Deed")
    ipfs_cid = String("QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco")
    doc_hash = String("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")

    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.register_land(
            parcel_id=parcel_id,
            location=location,
            area_sqft=area_sqft,
            property_type=property_type,
            document_type=document_type,
            owner=owner_account,
            ipfs_cid=ipfs_cid,
            document_hash=doc_hash,
        )

    assert contract.is_land_registered(parcel_id)
    record = contract.get_land(parcel_id)
    assert record.parcel_id.native == parcel_id
    assert record.owner == arc4.Address(owner_account)
    assert record.document_type.native == document_type
    assert record.ipfs_cid.native == ipfs_cid
    assert record.is_approved.native is True
    assert record.is_for_sale.native is False


def test_list_and_delist_land(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    owner_account = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    parcel_id = String("PRCL-102")
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.register_land(
            parcel_id=parcel_id,
            location=String("Commercial Hub 5"),
            area_sqft=UInt64(5000),
            property_type=String("Commercial"),
            document_type=String("Title Deed"),
            owner=owner_account,
            ipfs_cid=String("QmHash123CID"),
            document_hash=String("QmHash123"),
        )

    # Owner lists land for sale
    with context.txn.create_group(active_txn_overrides={"sender": owner_account}):
        contract.list_for_sale(parcel_id, UInt64(10_000_000))

    record = contract.get_land(parcel_id)
    assert record.is_for_sale.native is True

    # Owner delists land
    with context.txn.create_group(active_txn_overrides={"sender": owner_account}):
        contract.delist_land(parcel_id)
    record_delisted = contract.get_land(parcel_id)
    assert record_delisted.is_for_sale.native is False


def test_transfer_ownership(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    owner_account = context.any.account()
    buyer_account = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    parcel_id = String("PRCL-103")
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.register_land(
            parcel_id=parcel_id,
            location=String("Farm Land Plot 9"),
            area_sqft=UInt64(10000),
            property_type=String("Agricultural"),
            document_type=String("Ownership Deed"),
            owner=owner_account,
            ipfs_cid=String("QmHashFarmCID"),
            document_hash=String("QmHashFarm"),
        )

    # Owner transfers ownership directly to buyer
    with context.txn.create_group(active_txn_overrides={"sender": owner_account}):
        contract.transfer_ownership(parcel_id, buyer_account)

    record = contract.get_land(parcel_id)
    assert record.owner == arc4.Address(buyer_account)


def test_buy_land(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    seller_account = context.any.account()
    buyer_account = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    parcel_id = String("PRCL-104")
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.register_land(
            parcel_id=parcel_id,
            location=String("Downtown Penthouse 12B"),
            area_sqft=UInt64(3000),
            property_type=String("Residential"),
            document_type=String("Sale Deed"),
            owner=seller_account,
            ipfs_cid=String("QmPenthouseHashCID"),
            document_hash=String("QmPenthouseHash"),
        )

    # Seller lists land for 50 ALGO (50,000,000 microalgos)
    with context.txn.create_group(active_txn_overrides={"sender": seller_account}):
        price = 50_000_000
        contract.list_for_sale(parcel_id, UInt64(price))

    # Buyer creates payment transaction to seller
    pay_txn = context.any.txn.payment(
        sender=buyer_account,
        receiver=seller_account,
        amount=price,
    )

    # Buyer executes buy_land
    with context.txn.create_group(active_txn_overrides={"sender": buyer_account}):
        contract.buy_land(parcel_id, pay_txn)

    record = contract.get_land(parcel_id)
    assert record.owner == arc4.Address(buyer_account)
    assert record.is_for_sale.native is False


def test_delete_land(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    owner_account = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    parcel_id = String("PRCL-105")
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.register_land(
            parcel_id=parcel_id,
            location=String("Delete Test Zone"),
            area_sqft=UInt64(1200),
            property_type=String("Residential"),
            document_type=String("Deed"),
            owner=owner_account,
            ipfs_cid=String("QmDeleteCID"),
            document_hash=String("QmDeleteHash"),
        )

    assert contract.is_land_registered(parcel_id) is True

    # Owner deletes land record from Box Storage
    with context.txn.create_group(active_txn_overrides={"sender": owner_account}):
        contract.delete_land(parcel_id)

    assert contract.is_land_registered(parcel_id) is False

