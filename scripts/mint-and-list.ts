import { ethers } from "hardhat"
import { BasicNFT, NftMarketplace } from "../typechain-types"

const PRICE = ethers.utils.parseEther("0.1")

async function mintAndList() {
    const nftMarketplace: NftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft: BasicNFT = await ethers.getContract("BasicNFT")

    console.log("Minting...")
    const mintTx = await basicNft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId

    console.log("Approving NFT...")
    const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId)
    const approvalTxReceipt = await approvalTx.wait(1)

    console.log("Listing NFT...")
    const listItemTx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
    const listItemTxReceipt = await listItemTx.wait(1)
}

mintAndList()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
