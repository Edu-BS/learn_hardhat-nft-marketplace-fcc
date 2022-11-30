import { network } from "hardhat"
import { DeployFunction } from "hardhat-deploy/types"
import { developmentChains } from "../helper-hardhat-config"
import verify from "../utils/verify"

const deployNftMarketplace: DeployFunction = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const args = []

    const nftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        args: args,
        log: true,
        // @ts-ignore
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name)) {
        log("Verifying...")
        await verify(nftMarketplace.address, args)
    }
}

export default deployNftMarketplace
deployNftMarketplace.tags = ["all", "nftMarketplace"]
