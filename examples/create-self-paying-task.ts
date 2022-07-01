import hre from "hardhat";
import { GelatoOpsSDK, isGelatoOpsSupported, TaskTransaction } from "@gelatonetwork/ops-sdk";
import { Contract } from "ethers";
import { COUNTER_WITHOUT_TREASURY_ADDRESSES, COUNTER_RESOLVER_WITHOUT_TREASURY_ADDRESSES } from "../constants";
import counterAbi from "../contracts/abis/CounterWithoutTreasury.json";
import counterResolverAbi from "../contracts/abis/CounterResolverWithoutTreasury.json";

async function main() {
  const chainId = hre.network.config.chainId as number;
  if (!isGelatoOpsSupported(chainId)) {
    console.log(`Gelato Ops network not supported (${chainId})`);
    return;
  }

  if (!COUNTER_WITHOUT_TREASURY_ADDRESSES[chainId]) {
    console.log(`Self paying task example not available on this network (${chainId})`);
    return;
  }

  // Init GelatoOpsSDK
  const [signer] = await hre.ethers.getSigners();
  const gelatoOps = new GelatoOpsSDK(chainId, signer);

  // Prepare Task data to automate
  const counter = new Contract(COUNTER_WITHOUT_TREASURY_ADDRESSES[chainId], counterAbi, signer);
  const resolver = new Contract(COUNTER_RESOLVER_WITHOUT_TREASURY_ADDRESSES[chainId], counterResolverAbi, signer);
  const selector = counter.interface.getSighash("increaseCount(uint256)");
  const resolverData = resolver.interface.getSighash("checker()");

  // Create task
  console.log("Creating Task...");
  const { taskId, tx }: TaskTransaction = await gelatoOps.createTask({
    execAddress: counter.address,
    execSelector: selector,
    execAbi: JSON.stringify(counterAbi),
    resolverAddress: resolver.address,
    resolverData: resolverData,
    resolverAbi: JSON.stringify(counterResolverAbi),
    useTreasury: false,
    name: "Automated Counter without treasury",
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
