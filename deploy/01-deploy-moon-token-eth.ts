import { network, deployments, getNamedAccounts } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat.config";
import { verify } from "../scripts/utils/verify";

const deployMoonTokenEth: DeployFunction = async ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) => {
  const { log, deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = network.config.chainId || 31337;

  const moonToken = await deploy("MoonTokenEth", {
    from: deployer,
    args: [],
    waitConfirmations: 1,
  });

  const moonTokenAddress = moonToken.address;
  log(`Moon (Eth) deployed at ${moonToken.address}`);

  if (chainId in networkConfig && !developmentChains.includes(networkConfig[chainId].name)) {
    await verify(moonTokenAddress, []);
  }
};

export default deployMoonTokenEth;
deployMoonTokenEth.tags = ["moon-on-eth"];
