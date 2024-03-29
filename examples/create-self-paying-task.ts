import { AutomateSDK, isAutomateSupported, TaskTransaction, TriggerType } from "@gelatonetwork/automate-sdk";
import { Contract } from "ethers";
import hre from "hardhat";
import { COUNTER_WITHOUT_TREASURY_ADDRESSES } from "../constants";
import counterAbi from "../contracts/abis/CounterTestWT.json";

async function main() {
  const chainId = hre.network.config.chainId as number;
  if (!isAutomateSupported(chainId)) {
    console.log(`Gelato Automate network not supported (${chainId})`);
    return;
  }

  if (!COUNTER_WITHOUT_TREASURY_ADDRESSES[chainId]) {
    console.log(`Self paying task example not available on this network (${chainId})`);
    return;
  }

  // Init AutomateSDK
  const [signer] = await hre.ethers.getSigners();
  const automate = new AutomateSDK(chainId, signer);

  // Prepare Task data to automate
  const counter = new Contract(COUNTER_WITHOUT_TREASURY_ADDRESSES[chainId], counterAbi, signer);
  const selector = counter.interface.getSighash("increaseCount(uint256)");
  const resolverData = counter.interface.getSighash("checker()");

  // Create task
  console.log("Creating Task...");
  const { taskId, tx }: TaskTransaction = await automate.createTask({
    execAddress: counter.address,
    execSelector: selector,
    execAbi: JSON.stringify(counterAbi),
    resolverAddress: counter.address,
    resolverData: resolverData,
    resolverAbi: JSON.stringify(counterAbi),
    useTreasury: false,
    name: "Automated Counter without treasury",
    dedicatedMsgSender: true,
    trigger: {
      interval: 60 * 1000,
      type: TriggerType.TIME,
    },
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
