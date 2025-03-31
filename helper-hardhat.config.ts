import "dotenv/config";

interface NetworkConfigItem {
  name: string;
}

interface NetworkConfigMap {
  [chainId: number]: NetworkConfigItem;
}

export const networkConfig: NetworkConfigMap = {
  1337: {
    name: "localhost",
  },
  31337: {
    name: "localhost",
  },
  11155111: {
    name: "sepolia",
  },
  84532: {
    name: "base-sepolia",
  },
};

export const developmentChains: string[] = ["hardhat", "localhost"];
