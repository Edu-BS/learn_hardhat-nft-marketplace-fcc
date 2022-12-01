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
            player: SignerWithAddress
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
    })
}

const testNetTest = () => {
    describe.skip
}

!developmentChains.includes(network.name) ? testNetTest() : localNetTest()
