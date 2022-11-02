import { HardhatUserConfig } from "hardhat/config";

// PLUGINS
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";

// Process Env Variables
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ALCHEMY_ID = process.env.ALCHEMY_ID;

const config: HardhatUserConfig = {
  defaultNetwork: "mumbai",

  networks: {
    goerli: {
      chainId: 5,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_ID}`,
    },

    opgoerli: {
      chainId: 420,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      url: `https://goerli.optimism.io`,
    },

    mumbai: {
      chainId: 80001,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      url: "https://matic-mumbai.chainstacklabs.com", //`https://rpc-mumbai.matic.today`, // https://rpc-mumbai.matic.today
    },
  },

  solidity: {
    compilers: [
      {
        version: "0.8.12",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
  },
};

export default config;
