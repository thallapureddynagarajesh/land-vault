import algokit_utils
import pytest
from algokit_utils import (
    AlgoAmount,
    AlgorandClient,
    SigningAccount,
)

from smart_contracts.artifacts.land_contract.land_contract_client import (
    LandContractClient,
    LandContractFactory,
)


@pytest.fixture()
def deployer(algorand_client: AlgorandClient) -> SigningAccount:
    try:
        algorand_client.client.algod.health()
    except Exception:
        pytest.skip("Algod LocalNet is not running")

    account = algorand_client.account.from_environment("DEPLOYER")
    algorand_client.account.ensure_funded_from_environment(
        account_to_fund=account.address, min_spending_balance=AlgoAmount.from_algo(10)
    )
    return account


@pytest.fixture()
def land_contract_client(
    algorand_client: AlgorandClient, deployer: SigningAccount
) -> LandContractClient:
    factory = algorand_client.client.get_typed_app_factory(
        LandContractFactory, default_sender=deployer.address
    )

    client, _ = factory.deploy(
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
        on_update=algokit_utils.OnUpdate.AppendApp,
    )
    return client


def test_land_contract_deployment(land_contract_client: LandContractClient) -> None:
    admin = land_contract_client.send.get_admin()
    assert admin.abi_return is not None

