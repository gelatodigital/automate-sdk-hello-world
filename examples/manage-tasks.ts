import hre from "hardhat";
import { AutomateSDK, isAutomateSupported, Task, TaskTransaction } from "@gelatonetwork/automate-sdk";

async function main() {
  const chainId = hre.network.config.chainId as number;
  if (!isAutomateSupported(chainId)) {
    console.log(`Gelato Automate network not supported (${chainId})`);
    return;
  }

  // Init AutomateSDK
  const [signer] = await hre.ethers.getSigners();
  const automate = new AutomateSDK(chainId, signer);

  // Retrieve active tasks
  const activeTasks = await automate.getActiveTasks();
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
  await automate.renameTask(task.taskId, newName);
  console.log(`Task renamed, taskId: ${task.taskId} - ${newName}`);
  console.log(`> https://app.gelato.network/task/${task.taskId}?chainId=${chainId}`);

  // Cancel a task
  console.log(`Canceling task...`);
  const { taskId, tx }: TaskTransaction = await automate.cancelTask(task.taskId);
  await tx.wait();
  console.log(`Task canceled, taskId: ${taskId} (tx hash: ${tx.hash})`);
  console.log(`> https://app.gelato.network/task/${taskId}?chainId=${chainId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
