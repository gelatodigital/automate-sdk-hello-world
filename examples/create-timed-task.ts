import hre from "hardhat";
import { GelatoOpsSDK, isGelatoOpsSupported, TaskTransaction } from "@gelatonetwork/ops-sdk";
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
  const { taskId, tx }: TaskTransaction = await gelatoOps.createTask({
    execAddress: counter.address,
    execSelector: selector,
    execData,
    execAbi: JSON.stringify(counterAbi),
    startTime,
    interval,
    name: "Automated counter every 5min",
    dedicatedMsgSender: true,
  });
  await tx.wait();
  console.log(`Task created, taskId: ${taskId} (tx hash: ${tx.hash})`);
  console.log(`> https://app.gelato.network/task/${taskId}?chainId=${chainId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
