import { AutomateSDK, isAutomateSupported, TaskTransaction, TriggerType } from "@gelatonetwork/automate-sdk";
import { Contract } from "ethers";
import hre from "hardhat";
import { COUNTER_ADDRESSES } from "../constants";
import counterAbi from "../contracts/abis/CounterTest.json";

async function main() {
  const chainId = hre.network.config.chainId as number;
  if (!isAutomateSupported(chainId)) {
    console.log(`Gelato Automate network not supported (${chainId})`);
    return;
  }

  // Init AutomateSDK
  const [signer] = await hre.ethers.getSigners();
  const automate = new AutomateSDK(chainId, signer);

  // Prepare Task data to automate
  const counter = new Contract(COUNTER_ADDRESSES[chainId], counterAbi, signer);
  const selector = counter.interface.getSighash("increaseCount(uint256)");
  const execData = counter.interface.encodeFunctionData("increaseCount", [42]);
  const startTime = Date.now() + 60 * 1000; // start in 1 minute
  const interval = 5 * 100 * 60; // exec every 5 minutes

  // Create task
  console.log("Creating Task...");
  const { taskId, tx }: TaskTransaction = await automate.createTask({
    execAddress: counter.address,
    execSelector: selector,
    execData,
    execAbi: JSON.stringify(counterAbi),
    trigger: {
      start: startTime,
      interval,
      type: TriggerType.TIME,
    },
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
