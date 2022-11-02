# Gelato Ops SDK Hello World <!-- omit in toc -->

Example task automation using Gelato Ops SDK:
- [Deploy a contract & automate your function call](#deploy-a-contract--automate-your-function-call)
- [Configure your task execution:](#configure-your-task-execution)
  - [1. Use pre-define input (run whenever possible)](#1-use-pre-define-input-run-whenever-possible)
  - [2. Use dynamic input with a resolver contract](#2-use-dynamic-input-with-a-resolver-contract)
  - [3. Time based execution](#3-time-based-execution)
  - [4. Time based execution using a resolver for dynamic input](#4-time-based-execution-using-a-resolver-for-dynamic-input)
  - [5. Self paying task](#5-self-paying-task)
  - [6. Single execution task](#6-single-execution-tasks)
- [msg.sender of task executions](#msgsender-of-task-executions)
- [Manage your tasks](#manage-your-tasks)

  
## Prerequisite  <!-- omit in toc -->

- Check [ops-sdk](https://www.npmjs.com/package/@gelatonetwork/ops-sdk) npm package page to know more about how to use the Gelato Ops SDK
<br/><br/>


## How to run   <!-- omit in toc -->

1. Install project dependencies:
```
yarn install
```

2. Create a `.env` file with your private config:
```
PRIVATE_KEY= 
ALCHEMY_ID= <- required for ropsten & rinkeby
```

## Deploy a contract & automate your function call

- Use `gelatoOps.createTask` and specify your contract call with `execAddress`, `execSelector` & `execData`:
```ts
  // Deploying Counter contract
  const counterFactory = await hre.ethers.getContractFactory("Counter");
  const counter = await counterFactory.deploy(GELATO_ADDRESSES[chainId].ops);
  await counter.deployed();

  // Call Counter.increaseCount(42) every 10 minutes
  const { taskId, tx }: TaskTransaction = await gelatoOps.createTask({
    execAddress: counter.address,
    execSelector: counter.interface.getSighash("increaseCount(uint256)"),
    execData: counter.interface.encodeFunctionData("increaseCount", [42]),
    execAbi: counter.interface.format("json") as string,
    interval: 10 * 60, // execute every 10 minutes
    name: "Automated counter every 10min",
    dedicatedMsgSender: true
  });
```

- Check the example source code [`examples/deploy-create-task.ts`](./examples/deploy-create-task.ts) and try it yourself using:
```
yarn run deploy-create-task --network rinkeby
```


## Configure your task execution:

### 1. Use pre-define input (run whenever possible)

- Use `gelatoOps.createTask` and specify your contract call with `execAddress`, `execSelector` & `execData`:
```ts
// Prepare Task data to automate
const counter = new Contract(COUNTER_ADDRESSES, counterAbi, signer);
const selector = counter.interface.getSighash("increaseCount(uint256)");
const data = counter.interface.encodeFunctionData("increaseCount", [42]);

// Create task
const { taskId, tx }: TaskTransaction = await gelatoOps.createTask({
  execAddress: counter.address,
  execSelector: selector,
  execData: data,
  name: "Automated Counter with pre-defined input",
  dedicatedMsgSender: true
});
```

- Check the example source code [`examples/create-task-predefined-input.ts`](./examples/create-task-predefined-input.ts) and try it yourself using:
```
yarn run create-task-predefined-input --network rinkeby
```
<br/>


### 2. Use dynamic input with a resolver contract

- Use `gelatoOps.createTask` and specify your resolver function with `resolverAddress` & `resolverData`:
```ts
// Prepare Task data to automate
const counter = new Contract(COUNTER_ADDRESSES, counterAbi, signer);
const resolver = new Contract(COUNTER_RESOLVER_ADDRESSES, counterResolverAbi, signer);
const selector = counter.interface.getSighash("increaseCount(uint256)");
const resolverData = resolver.interface.getSighash("checker()");

// Create task
const { taskId, tx }: TaskTransaction = await gelatoOps.createTask({
  execAddress: counter.address,
  execSelector: selector,
  resolverAddress: resolver.address,
  resolverData: resolverData,
  name: "Automated counter using resolver",
  dedicatedMsgSender: true
});
```

- Check the example source code [`examples/create-task-with-resolver.ts`](./examples/create-task-with-resolver.ts) and try it yourself using:
```
yarn run create-task-with-resolver --network rinkeby
```
<br/>


### 3. Time based execution 

- Use `gelatoOps.createTask` with your execution `interval` & set your optional `startTime`:
```ts
// Prepare Task data to automate
const counter = new Contract(COUNTER_ADDRESSES, counterAbi, signer);
const selector = counter.interface.getSighash("increaseCount(uint256)");
const execData = counter.interface.encodeFunctionData("increaseCount", [42]);
const startTime = Math.floor(Date.now() / 1000) + 60; // start in 1 minute
const interval = 5 * 60; // exec every 5 minutes

// Create task
console.log("Creating Timed Task...");
const { taskId, tx }: TaskTransaction = await gelatoOps.createTask({
  execAddress: counter.address,
  execSelector: selector,
  execData,
  startTime, // starting timestamp in seconds
  interval, // execution interval in seconds
  name: "Automated counter every 5min",
  dedicatedMsgSender: true
});
```

- Check the example source code [`examples/create-timed-task.ts`](./examples/create-timed-task.ts) and try it yourself using:
```
yarn run create-timed-task --network rinkeby
```
<br/>


### 4. Time based execution using a resolver for dynamic input

- Use `gelatoOps.createTask` with your execution `interval` & set your resolver function with `resolverAddress` & `resolverData`:
```ts
// Prepare Task data to automate
const counter = new Contract(COUNTER_ADDRESSES, counterAbi, signer);
const resolver = new Contract(COUNTER_RESOLVER_ADDRESSES, counterResolverAbi, signer);
const selector = counter.interface.getSighash("increaseCount(uint256)");
const resolverData = resolver.interface.getSighash("checker()");
const interval = 5 * 60; // exec every 5 minutes

// Create task
console.log("Creating Timed Task...");
const { taskId, tx }: TaskTransaction = await gelatoOps.createTask({
  execAddress: counter.address,
  execSelector: selector,
  resolverAddress: resolver.address,
  resolverData: resolverData,
  interval, // execution interval in seconds
  name: "Automated counter with resolver every 5min",
  dedicatedMsgSender: true
});
```

- Check the example source code [`examples/create-timed-task-with-resolver.ts`](./examples/create-timed-task-with-resolver.ts) and try it yourself using:
```
yarn run create-timed-task-with-resolver --network rinkeby
```
<br/>

### 5. Self paying task 

- Use `gelatoOps.createTask` and set `useTreasury: false` to let the task pay for itself:
```ts
// Prepare Task data to automate
const counter = new Contract(COUNTER_WITHOUT_TREASURY_ADDRESSES, counterAbi, signer);
const resolver = new Contract(COUNTER_RESOLVER_WITHOUT_TREASURY_ADDRESSES, counterResolverAbi, signer);
const selector = counter.interface.getSighash("increaseCount(uint256)");
const resolverData = resolver.interface.getSighash("checker()");

// Create task
console.log("Creating Task...");
const { taskId, tx }: TaskTransaction = await gelatoOps.createTask({
  execAddress: counter.address,
  execSelector: selector,
  resolverAddress: resolver.address,
  resolverData: resolverData,
  useTreasury: false,
  name: "Automated Counter without treasury",
  dedicatedMsgSender: true
});
```

- Check the example source code [`examples/create-self-paying-task.ts`](./examples/create-self-paying-task.ts) and try it yourself using:
```
yarn run create-self-paying-task --network rinkeby
```
<br/>

### 6. Single execution tasks

- Use `gelatoOps.createTask` and set `singleExec: true` for tasks that only need to be executed once. The task is automatically cancelled on the first execution.
```ts
// Prepare Task data to automate
const counter = new Contract(COUNTER_ADDRESSES, counterAbi, signer);
const resolver = new Contract(COUNTER_RESOLVER_ADDRESSES, counterResolverAbi, signer);
const selector = counter.interface.getSighash("increaseCount(uint256)");
const resolverData = resolver.interface.getSighash("checker()");

// Create task
const { taskId, tx }: TaskTransaction = await gelatoOps.createTask({
  execAddress: counter.address,
  execSelector: selector,
  resolverAddress: resolver.address,
  resolverData: resolverData,
  dedicatedMsgSender: true,
  name: "Automated counter using resolver",
  dedicatedMsgSender: true,
  singleExec: true
});
```

## `msg.sender` of task executions

If you set `dedicatedMsgSender: true`, your task will be called via a dedicated `msg.sender` which you can whitelist on your smart contract for extra security.

To get your dedicated `msg.sender` :
```ts
// Get dedicated msg.sender to whitelist
const { address, isDeployed } = await gelatoOps.getDedicatedMsgSender()
```

If `dedicatedMsgSender: false`, the `msg.sender` of the task will be Ops contract.

## Manage your tasks

- Use `gelatoOps.getActiveTasks` to retrieve all active that you created:
```ts
const activeTasks = await gelatoOps.getActiveTasks();
activeTasks.forEach((task: Task) => {
  console.log(`- ${task.name} (${task.taskId})`);
});
```

- Use `gelatoOps.renameTask` to rename one of your task:
```ts
const task: Task = activeTasks[0];
await gelatoOps.renameTask(task.taskId, `[RENAMED] ${task.name}`);
```

- Use `gelatoOps.cancelTask` to cancel one of your task:
```ts
const task: Task = activeTasks[0];
await gelatoOps.cancelTask(task.taskId);
```

- Check the example source code [`examples/manage-tasks.ts`](./examples/manage-tasks.ts) and try it yourself using:
```
yarn run manage-tasks --network rinkeby
```
<br/>
