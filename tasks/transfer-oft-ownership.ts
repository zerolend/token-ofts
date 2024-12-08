/**
  Script to setup OFTs for the token on the various networks.

  npx hardhat transfer-ofts-ownership --network arbitrum
  npx hardhat transfer-ofts-ownership --network base
  npx hardhat transfer-ofts-ownership --network bsc
  npx hardhat transfer-ofts-ownership --network xlayer
  npx hardhat transfer-ofts-ownership --network linea
  npx hardhat transfer-ofts-ownership --network mainnet
  npx hardhat transfer-ofts-ownership --network optimism
 */
import _ from "underscore";
import { config } from "./config";
import { task } from "hardhat/config";
import { waitForTx } from "../scripts/utils";

task(`transfer-ofts-ownership`).setAction(async (_, hre) => {
  const c = config[hre.network.name];
  if (!c) throw new Error("cannot find connection");

  // await hre.run("setup-oft", { token });

  const [deployer] = await hre.ethers.getSigners();
  const oftD = await hre.deployments.get(`ZeroToken${c.contract}`);

  const oft = await hre.ethers.getContractAt(
    "contracts/LayerZeroCustomOFT.sol:LayerZeroCustomOFT",
    oftD.address
  );
  console.log(
    "deployer",
    deployer.address,
    `ZeroToken${c.contract}`,
    oft.target,
    await oft.endpoint()
  );
  const endpoint = await hre.ethers.getContractAt(
    "contracts/IL0EndpointV2.sol:IL0EndpointV2",
    await oft.endpoint()
  );

  console.log("hit");
  const timelockD = await hre.deployments.getOrNull("MAHATimelockController");
  const safeD = await hre.deployments.get("GnosisSafe");

  const owner = await oft.owner();
  console.log("\nworking on network", hre.network.name);
  console.log("current delegate", await endpoint.delegates(oftD.address));
  console.log("current owner", owner);

  if (owner.toLowerCase() == deployer.address.toLowerCase()) {
    console.log("\ntransferring ownership to timelock and safe");
    await waitForTx(await oft.setDelegate(safeD.address));
    await waitForTx(
      await oft.transferOwnership(
        !timelockD ? safeD.address : timelockD.address
      )
    );
  }

  console.log("\nnew delegate", await endpoint.delegates(oftD.address));
  console.log("new owner", await oft.owner());
});
