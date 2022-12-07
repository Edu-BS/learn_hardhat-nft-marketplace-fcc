import {
    frontEndContractsFile,
    frontEndContractsFile2,
    frontEndAbiLocation,
    frontEndAbiLocation2,
} from "../helper-hardhat-config"
import "dotenv/config"
import fs from "fs"
import { network, ethers } from "hardhat"
import {DeployFunction} from "hardhat-deploy/types"
import {HardhatRuntimeEnvironment} from "hardhat/types"

const updateFrontEnd: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
  ) {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")

    let nftMarketplaceString = nftMarketplace.interface.format(ethers.utils.FormatTypes.json).toString()
    let nftMarketplaceIndented = JSON.stringify(JSON.parse(nftMarketplaceString), null, 4)
    fs.writeFileSync(
        `${frontEndAbiLocation2}NftMarketplace.json`,
        nftMarketplaceIndented
    )

    const basicNft = await ethers.getContract("BasicNFT")
    
    let basicNftString = basicNft.interface.format(ethers.utils.FormatTypes.json).toString()
    let basicNftIndented = JSON.stringify(JSON.parse(basicNftString), null, 4)
    fs.writeFileSync(
        `${frontEndAbiLocation2}BasicNft.json`,
        basicNftIndented,
    )
}

async function updateContractAddresses() {
    const chainId = network.config.chainId!.toString()
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile2, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address)
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
    }
    fs.writeFileSync(frontEndContractsFile2, JSON.stringify(contractAddresses, null, 4))
}
export default updateFrontEnd
updateFrontEnd.tags = ["all", "frontend"]