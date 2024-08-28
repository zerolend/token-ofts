import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deployContract } from "../scripts/utils";
import { config } from "../tasks/config";
import assert from "assert";

async function main(hre: HardhatRuntimeEnvironment) {
  assert(hre.network.name === "linea", "only linea");
  const zaiD = await hre.deployments.get("ZeroToken");
  await deployContract(
    hre,
    "LayerZeroCustomOFTAdapter",
    [zaiD.address, config[hre.network.name].libraries.endpoint],
    "ZeroTokenOFTAdapter"
  );
}

main.tags = ["ZeroTokenOFTAdapter"];
export default main;
