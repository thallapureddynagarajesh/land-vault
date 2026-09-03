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


def test_submit_land_starts_pending(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    owner_account = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    parcel_id = String("PRCL-101")
    survey_number = String("SURVEY-101/A")
    location = String("Zone A, Plot 42")
    area_sqft = UInt64(2500)
    property_type = String("Residential")
    document_type = String("Sale Deed")
    ipfs_cid = String("QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco")
    doc_hash = String("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")

    # Owner submits land
    with context.txn.create_group(active_txn_overrides={"sender": owner_account}):
        contract.submit_land(
            parcel_id=parcel_id,
            survey_number=survey_number,
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
    assert record.survey_number.native == survey_number
    assert record.owner == arc4.Address(owner_account)
    assert record.status.as_uint64() == 0  # PENDING
    assert record.is_approved.native is False


def test_approve_land_by_registrar(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    owner_account = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    parcel_id = String("PRCL-102")
    with context.txn.create_group(active_txn_overrides={"sender": owner_account}):
        contract.submit_land(
            parcel_id=parcel_id,
            survey_number=String("SURVEY-102"),
            location=String("Commercial Hub 5"),
            area_sqft=UInt64(5000),
            property_type=String("Commercial"),
            document_type=String("Title Deed"),
            owner=owner_account,
            ipfs_cid=String("QmHash123CID"),
            document_hash=String("QmHash123"),
        )

    # Registrar approves land
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.approve_land(parcel_id)

    record = contract.get_land(parcel_id)
    assert record.status.as_uint64() == 1  # VERIFIED
    assert record.is_approved.native is True
    assert record.verified_by == arc4.Address(admin_account)


def test_reject_land_by_registrar(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    owner_account = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    parcel_id = String("PRCL-103")
    with context.txn.create_group(active_txn_overrides={"sender": owner_account}):
        contract.submit_land(
            parcel_id=parcel_id,
            survey_number=String("SURVEY-103"),
            location=String("Farm Land Plot 9"),
            area_sqft=UInt64(10000),
            property_type=String("Agricultural"),
            document_type=String("Ownership Deed"),
            owner=owner_account,
            ipfs_cid=String("QmHashFarmCID"),
            document_hash=String("QmHashFarm"),
        )

    # Registrar rejects land with reason
    reason = String("Invalid boundary map details submitted.")
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.reject_land(parcel_id, reason)

    record = contract.get_land(parcel_id)
    assert record.status.as_uint64() == 2  # REJECTED
    assert record.is_approved.native is False
    assert record.rejection_reason.native == reason


def test_unauthorized_approval_rejected(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    owner_account = context.any.account()
    unauthorized_user = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    parcel_id = String("PRCL-104")
    with context.txn.create_group(active_txn_overrides={"sender": owner_account}):
        contract.submit_land(
            parcel_id=parcel_id,
            survey_number=String("SURVEY-104"),
            location=String("Test Plot"),
            area_sqft=UInt64(1000),
            property_type=String("Residential"),
            document_type=String("Deed"),
            owner=owner_account,
            ipfs_cid=String("QmHashCID"),
            document_hash=String("QmHash"),
        )

    # Unauthorized user attempts to approve
    with pytest.raises(AssertionError, match="Only authorized registrar can approve land"):
        with context.txn.create_group(active_txn_overrides={"sender": unauthorized_user}):
            contract.approve_land(parcel_id)


def test_transfer_restricted_to_verified(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    owner_account = context.any.account()
    buyer_account = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    parcel_id = String("PRCL-105")
    with context.txn.create_group(active_txn_overrides={"sender": owner_account}):
        contract.submit_land(
            parcel_id=parcel_id,
            survey_number=String("SURVEY-105"),
            location=String("Test Transfer Plot"),
            area_sqft=UInt64(2000),
            property_type=String("Residential"),
            document_type=String("Deed"),
            owner=owner_account,
            ipfs_cid=String("QmHashTransferCID"),
            document_hash=String("QmHashTransfer"),
        )

    # Attempting to transfer PENDING land fails
    with pytest.raises(AssertionError, match="ERROR: Ownership transfer is allowed only for VERIFIED land records."):
        with context.txn.create_group(active_txn_overrides={"sender": owner_account}):
            contract.transfer_ownership(parcel_id, buyer_account)

    # Once approved, transfer succeeds
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.approve_land(parcel_id)

    with context.txn.create_group(active_txn_overrides={"sender": owner_account}):
        contract.transfer_ownership(parcel_id, buyer_account)

    record = contract.get_land(parcel_id)
    assert record.owner == arc4.Address(buyer_account)
    assert record.transfer_count.as_uint64() == 1


def test_delete_land(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    owner_account = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    parcel_id = String("PRCL-106")
    with context.txn.create_group(active_txn_overrides={"sender": owner_account}):
        contract.submit_land(
            parcel_id=parcel_id,
            survey_number=String("SURVEY-106"),
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


def test_unauthorized_register_land_fails(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    user_account = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    # Non-admin user attempts register_land directly
    with pytest.raises(AssertionError, match="Only admin can register land directly"):
        with context.txn.create_group(active_txn_overrides={"sender": user_account}):
            contract.register_land(
                parcel_id=String("PRCL-999"),
                location=String("Direct Plot"),
                area_sqft=UInt64(3000),
                property_type=String("Commercial"),
                document_type=String("Deed"),
                owner=user_account,
                ipfs_cid=String("QmCID"),
                document_hash=String("QmHash"),
            )


def test_buy_land_marketplace(context: AlgopyTestContext) -> None:
    admin_account = context.any.account()
    seller_account = context.any.account()
    buyer_account = context.any.account()

    contract = LandContract()
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.create_application()

    parcel_id = String("PRCL-MARKET-1")
    with context.txn.create_group(active_txn_overrides={"sender": seller_account}):
        contract.submit_land(
            parcel_id=parcel_id,
            survey_number=String("SURVEY-M1"),
            location=String("Market District Plot 1"),
            area_sqft=UInt64(4000),
            property_type=String("Residential"),
            document_type=String("Deed"),
            owner=seller_account,
            ipfs_cid=String("QmMarketCID"),
            document_hash=String("QmMarketHash"),
        )

    # Approve land first
    with context.txn.create_group(active_txn_overrides={"sender": admin_account}):
        contract.approve_land(parcel_id)

    # List land for sale
    price = UInt64(10_000_000)  # 10 ALGO
    with context.txn.create_group(active_txn_overrides={"sender": seller_account}):
        contract.list_for_sale(parcel_id, price)

    record = contract.get_land(parcel_id)
    assert record.is_for_sale.native is True
    assert record.price_microalgos.as_uint64() == 10_000_000

    # Buyer buys land with payment txn
    pay_txn = context.any.txn.payment(
        sender=buyer_account,
        receiver=seller_account,
        amount=10_000_000,
    )

    with context.txn.create_group(active_txn_overrides={"sender": buyer_account}):
        contract.buy_land(parcel_id, pay_txn)

    record_after = contract.get_land(parcel_id)
    assert record_after.owner == arc4.Address(buyer_account)
    assert record_after.is_for_sale.native is False
    assert record_after.transfer_count.as_uint64() == 1

