import dvns from "./dvn-deployments.json";
import deployments from "./lz-chain-deployments.json";

export interface IL0Config {
  eid: number;
  confirmations: number;
  optionalDVNThreshold: number;
  requiredDVNs: string[];
  contract: "OFTAdapter" | "OFT";
  libraries: {
    endpoint: string;
    sendLib302: string;
    receiveLib302: string;
    executor: string;
  };
  dvns: {
    [name: string]: string; // list all the valid DVNs here and we'll match them when connecting the contracts
  };
}

export type IL0ConfigKey =
  | "arbitrum"
  | "base"
  | "blast"
  | "bsc"
  | "linea"
  | "mainnet"
  | "manta"
  | "zircuit"
  // | "optimism"
  // | "scroll"
  | "xlayer"
  | "berachain";

export type IL0ConfigMapping = {
  [key in IL0ConfigKey]: IL0Config;
};

const pluckDVNs = (network: string) => {
  const _dvns: {
    [name: string]: string;
  } = {};
  const providers = Object.keys(dvns);
  for (let index = 0; index < providers.length; index++) {
    const provider = providers[index];
    if (!!dvns[provider][network]) _dvns[provider] = dvns[provider][network];
  }

  return _dvns;
};

const pluckLibraries = (network: string) => {
  return {
    sendLib302: deployments[network].sendUln302,
    receiveLib302: deployments[network].receiveUln302,
    executor: deployments[network].executor,
    endpoint: deployments[network].endpointV2,
  };
};

export const config: IL0ConfigMapping = {
  arbitrum: {
    eid: 30110,
    contract: "OFT",
    confirmations: 15,
    optionalDVNThreshold: 2,
    libraries: pluckLibraries("Arbitrum-Mainnet"),
    dvns: pluckDVNs("arbitrum"),
    requiredDVNs: ["LayerZero_Labs"],
  },
  berachain: {
    eid: 30362,
    contract: "OFT",
    confirmations: 15,
    optionalDVNThreshold: 2,
    libraries: pluckLibraries("Berachain-Mainnet"),
    dvns: pluckDVNs("bera"),
    requiredDVNs: ["LayerZero_Labs"],
  },
  manta: {
    eid: 30217,
    contract: "OFT",
    confirmations: 15,
    optionalDVNThreshold: 2,
    libraries: pluckLibraries("Manta-Pacific-Mainnet"),
    dvns: pluckDVNs("manta"),
    requiredDVNs: ["LayerZero_Labs"],
  },
  zircuit: {
    eid: 30303,
    contract: "OFT",
    confirmations: 15,
    optionalDVNThreshold: 2,
    libraries: pluckLibraries("Zircuit-Mainnet"),
    dvns: pluckDVNs("zircuit"),
    requiredDVNs: ["LayerZero_Labs"],
  },
  linea: {
    eid: 30183,
    contract: "OFTAdapter",
    confirmations: 15,
    optionalDVNThreshold: 2,
    libraries: pluckLibraries("Linea-Mainnet"),
    dvns: pluckDVNs("linea"),
    requiredDVNs: ["LayerZero_Labs"],
  },
  mainnet: {
    eid: 30101,
    contract: "OFT",
    confirmations: 5,
    optionalDVNThreshold: 2,
    libraries: pluckLibraries("Ethereum-Mainnet"),
    dvns: pluckDVNs("ethereum"),
    requiredDVNs: ["LayerZero_Labs"],
  },
  base: {
    eid: 30184,
    contract: "OFT",
    confirmations: 15,
    optionalDVNThreshold: 2,
    libraries: pluckLibraries("Base-Mainnet"),
    dvns: pluckDVNs("base"),
    requiredDVNs: ["LayerZero_Labs"],
  },
  blast: {
    eid: 30243,
    contract: "OFT",
    confirmations: 15,
    optionalDVNThreshold: 2,
    libraries: pluckLibraries("Blast-Mainnet"),
    dvns: pluckDVNs("blast"),
    requiredDVNs: ["LayerZero_Labs"],
  },
  bsc: {
    eid: 30102,
    contract: "OFT",
    confirmations: 15,
    optionalDVNThreshold: 2,
    libraries: pluckLibraries("BNB-Smart-Chain-Mainnet"),
    dvns: pluckDVNs("bsc"),
    requiredDVNs: ["LayerZero_Labs"],
  },
  xlayer: {
    eid: 30274,
    contract: "OFT",
    confirmations: 15,
    optionalDVNThreshold: 2,
    libraries: pluckLibraries("X-Layer-Mainnet"),
    dvns: pluckDVNs("xlayer"),
    requiredDVNs: ["LayerZero_Labs"],
  },
  // scroll: {
  //   eid: 30214,
  //   contract: "OFT",
  //   confirmations: 15,
  //   optionalDVNThreshold: 2,
  //   libraries: pluckLibraries("scroll"),
  //   dvns: pluckDVNs("scroll"),
  //   requiredDVNs: ["LayerZero_Labs"],
  // },
  // optimism: {
  //   eid: 30111,
  //   contract: "OFT",
  //   confirmations: 15,
  //   optionalDVNThreshold: 2,
  //   libraries: pluckLibraries("optimism"),
  //   dvns: pluckDVNs("optimism"),
  //   requiredDVNs: ["LayerZero_Labs"],
  // },
};
