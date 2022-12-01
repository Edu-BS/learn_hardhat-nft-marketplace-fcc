import { JsonRpcProvider } from "@ethersproject/providers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { Signer } from "ethers"
import { network, deployments, ethers, getNamedAccounts } from "hardhat"
import { Address } from "hardhat-deploy/types"
import { developmentChains } from "../../helper-hardhat-config"
import { BasicNFT, NftMarketplace } from "../../typechain-types"

const localNetTest = () => {
    describe("NFT Marketplace Tests", function () {
        let nftMarketplace: NftMarketplace,
            basicNft: BasicNFT,
            deployer: Address,
            player: SignerWithAddress,
            provider: JsonRpcProvider
        const PRICE = ethers.utils.parseEther("0.1")
        const TOKEN_ID = 0

        beforeEach(async function () {
            // Get accounts
            const accounts = await ethers.getSigners()
            deployer = (await getNamedAccounts()).deployer // Only gets address
            // player = (await getNamedAccounts()).player // Only gets address
            player = accounts[1]

            // Wait until deployments done
            await deployments.fixture(["all"])

            // Get the SmartContracts
            nftMarketplace = await ethers.getContract("NftMarketplace")
            basicNft = await ethers.getContract("BasicNFT")

            // Prepare a NFT
            await basicNft.mintNft()
            await basicNft.approve(nftMarketplace.address, TOKEN_ID)

            provider = ethers.provider
        })

        it("lists and can be bought", async function () {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)

            const playerConnectedNftMarketplace = nftMarketplace.connect(player)
            await playerConnectedNftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                value: PRICE,
            })

            const newOwner = await basicNft.ownerOf(TOKEN_ID)
            const deployerProceeds = await nftMarketplace.getProceeds(deployer)

            assert(newOwner.toString() == player.address)
            assert(deployerProceeds.toString() == PRICE.toString())
        })

        it("can cancel the item listing", async function () {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)

            const listingBeforeCancel = await nftMarketplace.getListing(basicNft.address, TOKEN_ID)

            await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)

            const listingAfterCancel = await nftMarketplace.getListing(basicNft.address, TOKEN_ID)

            assert(listingBeforeCancel.price.toString() == PRICE.toString())
            assert(listingAfterCancel.price.toString() == "0")
        })

        it("can update listing, changing the price", async function () {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
            await nftMarketplace.updateListing(
                basicNft.address,
                TOKEN_ID,
                ethers.utils.parseEther("0.2")
            )
            const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID)

            assert(listing.price.toString() == ethers.utils.parseEther("0.2").toString())
        })

        it("can withdraw the proceeds", async function () {
            const playerConnectedNftMarketplace = nftMarketplace.connect(player)

            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
            playerConnectedNftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                value: PRICE,
            })

            const deployerProceedsBefore = await nftMarketplace.getProceeds(deployer)

            const balanceBeforeWithdraw = await provider.getBalance(deployer)
            const withdrawTx = await nftMarketplace.withdrawProceeds()
            const withdrawTxReceipt = await withdrawTx.wait(1)
            const { gasUsed, effectiveGasPrice } = withdrawTxReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const balanceAfterWithdraw = await provider.getBalance(deployer)

            assert.equal(
                balanceBeforeWithdraw.add(PRICE).toString(),
                balanceAfterWithdraw.add(gasCost).toString()
            )
        })
    })
}

const testNetTest = () => {
    describe.skip
}

!developmentChains.includes(network.name) ? testNetTest() : localNetTest()
