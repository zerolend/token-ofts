import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deployContract } from "../scripts/utils";
import { config } from "../tasks/config";

async function main(hre: HardhatRuntimeEnvironment) {
  const zaiD = await hre.deployments.get("ZeroToken");
  await deployContract(
    hre,
    "LayerZeroCustomOFTAdapter",
    [zaiD.address, config[hre.network.name].endpoint],
    "ZeroTokenOFTAdapter"
  );
}

main.tags = ["ZeroTokenOFTAdapter"];
export default main;
