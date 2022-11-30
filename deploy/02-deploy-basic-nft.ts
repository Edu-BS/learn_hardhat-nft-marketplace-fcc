import { network } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import verify from "../utils/verify"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const deployBasicNft: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("--------------")
    const args = []
    const basicNft = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log: true,
        // @ts-ignore
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(basicNft.address, args)
    }
    log("--------------")
}

export default deployBasicNft
deployBasicNft.tags = ["all", "basicnft", "main"]
