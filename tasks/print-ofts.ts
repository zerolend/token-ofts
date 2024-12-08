import { task } from "hardhat/config";
import { config } from "./config";
import { get } from "../scripts/helpers";

task(`print-ofts`, `Prints all the OFTs`).setAction(async ({}) => {
  const networks = Object.keys(config);

  for (let index = 0; index < networks.length; index++) {
    const network = networks[index];
    const remoteContractName = `ZeroToken${config[network].contract}`;
    const addr = get(remoteContractName, network);
    console.log(network, addr);
  }
});
