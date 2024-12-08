/**
  Script to setup OFTs for the token on the various networks.

  npx hardhat check-oft-ownership --network arbitrum --execute 1
  npx hardhat check-oft-ownership --network base --execute 1
  npx hardhat check-oft-ownership --network blast --execute 1
  npx hardhat check-oft-ownership --network bsc --execute 1
  npx hardhat check-oft-ownership --network xlayer --execute 1
  npx hardhat check-oft-ownership --network linea --execute 1
  npx hardhat check-oft-ownership --network zircuit --execute 1
  npx hardhat check-oft-ownership --network manta --execute 1
  npx hardhat check-oft-ownership --network mainnet --execute 1
 */
import _ from "underscore";
import { config } from "./config";
import { task } from "hardhat/config";
import { waitForTx } from "../scripts/utils";

task(`check-oft-ownership`, `Checks the OFT's ownership`)
  .addOptionalParam("execute", "execute the ownership transfer to safe")
  .setAction(async ({ execute }, hre) => {
    const c = config[hre.network.name];
    if (!c) throw new Error("cannot find connection");

    const safe = await hre.deployments.get(`GnosisSafe`);
    const oftD = await hre.deployments.get(`ZeroToken${c.contract}`);
    const oft = await hre.ethers.getContractAt(
      "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT.sol:OFT",
      oftD.address
    );
    const endpoint = await hre.ethers.getContractAt(
      "contracts/IL0EndpointV2.sol:IL0EndpointV2",
      await oft.endpoint()
    );

    console.log("checking for", hre.network.name);
    console.log("safe", safe.address);
    console.log("current owner", await oft.owner());
    console.log("current delegate", await endpoint.delegates(oft.target));

    if (execute && (await oft.owner()) !== safe.address) {
      const isContract = await hre.network.provider.request({
        method: "eth_getCode",
        params: [safe.address, "latest"],
      });

      if (isContract !== "0x") {
        console.log("executing changes");
        await waitForTx(await oft.setDelegate(safe.address));
        await waitForTx(await oft.transferOwnership(safe.address));
      } else {
        console.log("Address is not a safe");
      }
    }
    console.log("done\n");
  });
