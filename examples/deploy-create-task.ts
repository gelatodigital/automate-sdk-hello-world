import {
  AutomateSDK,
  GELATO_ADDRESSES,
  TaskTransaction,
  TriggerType,
  isAutomateSupported,
} from "@gelatonetwork/automate-sdk";
import hre from "hardhat";

async function main() {
  const chainId = hre.network.config.chainId as number;
  if (!isAutomateSupported(chainId)) {
    console.log(`Gelato Automate network not supported (${chainId})`);
    return;
  }

  // Init AutomateSDK
  const [signer] = await hre.ethers.getSigners();
  const automate = new AutomateSDK(chainId, signer);

  // Deploying Counter contract
  const counterFactory = await hre.ethers.getContractFactory("CounterTest");
  console.log("Deploying Counter...");
  const counter = await counterFactory.deploy(GELATO_ADDRESSES[chainId].automate);
  await counter.deployed();
  console.log("Counter deployed to:", counter.address);

  // Create Gelato automated ask
  console.log("Creating Task...");
  const { taskId, tx }: TaskTransaction = await automate.createTask({
    execAddress: counter.address,
    execSelector: counter.interface.getSighash("increaseCount(uint256)"),
    execData: counter.interface.encodeFunctionData("increaseCount", [42]),
    execAbi: counter.interface.format("json") as string,
    trigger: {
      interval: 60 * 10 * 1000,
      type: TriggerType.TIME,
    },
    name: "Automated counter every 10min",
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
