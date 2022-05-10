import hre from "hardhat";
import { GelatoOpsSDK, isGelatoOpsSupported, TaskReceipt } from "@gelatonetwork/ops-sdk";
import { Contract } from "ethers";
import { COUNTER_ADDRESSES } from "../constants";
import counterAbi from "../contracts/abis/Counter.json";

async function main() {
  const chainId = hre.network.config.chainId as number;
  if (!isGelatoOpsSupported(chainId)) {
    console.log(`Gelato Ops network not supported (${chainId})`);
    return;
  }

  // Init GelatoOpsSDK
  const [signer] = await hre.ethers.getSigners();
  const gelatoOps = new GelatoOpsSDK(chainId, signer);

  // Prepare Task data to automate
  const counter = new Contract(COUNTER_ADDRESSES[chainId], counterAbi, signer);
  const selector = counter.interface.getSighash("increaseCount(uint256)");
  const execData = counter.interface.encodeFunctionData("increaseCount", [42]);
  const startTime = Math.floor(Date.now() / 1000) + 60; // start in 1 minute
  const interval = 5 * 60; // exec every 5 minutes

  // Create task
  console.log("Creating Task...");
  const res: TaskReceipt = await gelatoOps.createTask({
    execAddress: counter.address,
    execSelector: selector,
    execData,
    execAbi: JSON.stringify(counterAbi),
    startTime,
    interval,
    name: "Automated counter every 5min",
  });
  console.log(`Task created, taskId: ${res.taskId} (tx hash: ${res.transactionHash})`);
  console.log(`> https://app.gelato.network/task/${res.taskId}?chainId=${chainId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
