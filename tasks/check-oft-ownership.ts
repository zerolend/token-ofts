/**
  Script to setup OFTs for the token on the various networks.

  npx hardhat check-oft-ownership --network arbitrum
  npx hardhat check-oft-ownership --network base
  npx hardhat check-oft-ownership --network blast
  npx hardhat check-oft-ownership --network bsc
  npx hardhat check-oft-ownership --network xlayer
  npx hardhat check-oft-ownership --network linea
  npx hardhat check-oft-ownership --network zircuit
  npx hardhat check-oft-ownership --network manta
  npx hardhat check-oft-ownership --network mainnet
 */
import _ from "underscore";
import { config, IL0Config, IL0ConfigKey } from "./config";
import { EnforcedOptionParamStruct } from "../types/@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT";
import { Options } from "@layerzerolabs/lz-v2-utilities";
import { task } from "hardhat/config";
import { waitForTx } from "../scripts/utils";
import { get } from "../scripts/helpers";
import { zeroPadValue } from "ethers";

const _fetchAndSortDVNS = (
  conf: IL0Config,
  dvns: string[] = [],
  remoteDvns: string[] = [],
  limit: number = 5000
) => {
  const commonDVNs = _.intersection(dvns, remoteDvns);
  return _.first(commonDVNs.map((dvn) => conf.dvns[dvn]).sort(), limit);
};

const _fetchOptionalDVNs = (conf: IL0Config) => {
  const dvns = Object.keys(conf.dvns);
  return _.difference(dvns, conf.requiredDVNs);
};

task(`check-oft-ownership`, `Checks the OFT's ownership`)
  .addOptionalParam("execute", "execute the ownership transfer to safe", true)
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

    console.log("current owner", await oft.owner());
    console.log("current delegate", await endpoint.delegates(oft.target));

    if (execute) {
      console.log("executing changes");
      await waitForTx(await oft.setDelegate(safe.address));
      await waitForTx(await oft.transferOwnership(safe.address));
    }
  });
