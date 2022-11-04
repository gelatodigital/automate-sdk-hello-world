import hre from "hardhat";
import { GelatoOpsSDK, isGelatoOpsSupported, TaskTransaction, GELATO_ADDRESSES } from "@gelatonetwork/ops-sdk";

async function main() {
  const chainId = hre.network.config.chainId as number;
  if (!isGelatoOpsSupported(chainId)) {
    console.log(`Gelato Ops network not supported (${chainId})`);
    return;
  }

  // Init GelatoOpsSDK
  const [signer] = await hre.ethers.getSigners();
  const gelatoOps = new GelatoOpsSDK(chainId, signer);

  // Deploying Counter contract
  const counterFactory = await hre.ethers.getContractFactory("CounterTest");
  console.log("Deploying Counter...");
  const counter = await counterFactory.deploy(GELATO_ADDRESSES[chainId].ops);
  await counter.deployed();
  console.log("Counter deployed to:", counter.address);

  // Create Gelato automated ask
  console.log("Creating Task...");
  const { taskId, tx }: TaskTransaction = await gelatoOps.createTask({
    execAddress: counter.address,
    execSelector: counter.interface.getSighash("increaseCount(uint256)"),
    execData: counter.interface.encodeFunctionData("increaseCount", [42]),
    execAbi: counter.interface.format("json") as string,
    interval: 10 * 60, // execute every 10 minutes
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
