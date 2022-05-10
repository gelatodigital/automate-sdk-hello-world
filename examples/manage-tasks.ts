import hre from "hardhat";
import { GelatoOpsSDK, isGelatoOpsSupported, Task, TaskReceipt } from "@gelatonetwork/ops-sdk";

async function main() {
  const chainId = hre.network.config.chainId as number;
  if (!isGelatoOpsSupported(chainId)) {
    console.log(`Gelato Ops network not supported (${chainId})`);
    return;
  }

  // Init GelatoOpsSDK
  const [signer] = await hre.ethers.getSigners();
  const gelatoOps = new GelatoOpsSDK(chainId, signer);

  // Retrieve active tasks
  const activeTasks = await gelatoOps.getActiveTasks();
  if (activeTasks.length === 0) {
    console.log("No active tasks");
    return;
  }

  console.log("Active tasks:");
  activeTasks.forEach((task: Task) => {
    console.log(`- ${task.name} (${task.taskId})`);
  });

  // Rename a task
  const task: Task = activeTasks[0];
  const newName = `[RENAMED] ${task.name}`;
  await gelatoOps.renameTask(task.taskId, newName);
  console.log(`Task renamed, taskId: ${task.taskId} - ${newName}`);
  console.log(`> https://app.gelato.network/task/${task.taskId}?chainId=${chainId}`);

  // Cancel a task
  console.log(`Canceling task...`);
  const res: TaskReceipt = await gelatoOps.cancelTask(task.taskId);
  console.log(`Task canceled, taskId: ${res.taskId} (tx hash: ${res.transactionHash})`);
  console.log(`> https://app.gelato.network/task/${res.taskId}?chainId=${chainId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
