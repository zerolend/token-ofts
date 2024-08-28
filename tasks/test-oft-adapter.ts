/**

  Script to send a test OFT to a target network

  npx hardhat test-oft-adapter --amt 1 --targetnetwork arbitrum --token zai  --network mainnet
  npx hardhat test-oft-adapter --amt 1 --targetnetwork base --token zai  --network mainnet
  npx hardhat test-oft-adapter --amt 1 --targetnetwork blast --token zai  --network mainnet
  npx hardhat test-oft-adapter --amt 1 --targetnetwork bsc --token zai  --network mainnet
  npx hardhat test-oft-adapter --amt 1 --targetnetwork linea --token zai  --network mainnet
  npx hardhat test-oft-adapter --amt 1 --targetnetwork optimism --token zai  --network mainnet
  npx hardhat test-oft-adapter --amt 1 --targetnetwork xlayer --token zai  --network mainnet
  npx hardhat test-oft-adapter --amt 1 --targetnetwork scroll --token zai  --network mainnet

 */
import { task } from "hardhat/config";
import { waitForTx } from "../scripts/utils";
import { config } from "./config";
import { Options } from "@layerzerolabs/lz-v2-utilities";

import { MaxUint256, parseEther, zeroPadValue } from "ethers";
import {
  MessagingFeeStruct,
  SendParamStruct,
} from "../types/@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT";

task(`test-oft-adapter`, `Tests the mainnet OFT adapter`)
  .addParam("token", "either zai or maha")
  .addParam("amt", "the amount of tokens")
  .addParam("targetnetwork", "The target network to send the OFT tokens to")
  .setAction(async ({ targetnetwork, token, amt }, hre) => {
    const contractNameToken = token === "zai" ? "ZaiStablecoin" : "MAHA";
    const zaiD = await hre.deployments.get(contractNameToken);
    const erc20 = await hre.ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
      zaiD.address
    );
    const [deployer] = await hre.ethers.getSigners();

    const source = config[hre.network.name];
    const target = config[targetnetwork];

    if (!source || !target) throw new Error("cannot find connection");

    const contractName = `${contractNameToken}${source.contract}`;
    const oftAdapterD = await hre.deployments.get(contractName);
    const oftAdapter = await hre.ethers.getContractAt(
      "LayerZeroCustomOFT",
      oftAdapterD.address
    );

    // Defining the amount of tokens to send and constructing the parameters for the send operation
    const tokensToSend = parseEther(amt);

    // Defining extra message execution options for the send operation
    const options = Options.newOptions()
      .addExecutorLzReceiveOption(200000, 0)
      .toHex()
      .toString();

    const params: SendParamStruct = {
      dstEid: target.eid,
      to: zeroPadValue(deployer.address, 32),
      amountLD: tokensToSend,
      minAmountLD: tokensToSend,
      extraOptions: options,
      composeMsg: "0x",
      oftCmd: "0x",
    };

    if (
      source.network === "mainnet" &&
      (await erc20.allowance(deployer.address, oftAdapter.target)) == 0
    ) {
      // If the source network is mainnet, we need to approve the OFT adapter to spend the tokens
      await waitForTx(await erc20.approve(oftAdapter.target, MaxUint256));
    }

    const [nativeFee] = await oftAdapter.quoteSend(params, false);

    const fee: MessagingFeeStruct = {
      nativeFee,
      lzTokenFee: 0n,
    };

    await waitForTx(
      await oftAdapter.send(params, fee, deployer.address, {
        value: nativeFee,
      })
    );
  });