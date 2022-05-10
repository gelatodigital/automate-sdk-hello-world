# Gelato Ops SDK Hello World <!-- omit in toc -->

Example task creations using Gelato Ops SDK:

- [1. Create a task with pre-define input (run whenever possible)](#1-create-a-task-with-pre-define-input-run-whenever-possible)
- [2. Create a task using a resolver contract](#2-create-a-task-using-a-resolver-contract)
- [3. Create a time based task](#3-create-a-time-based-task)
- [4. Create a time based task with a resolver for dynamic input](#4-create-a-time-based-task-with-a-resolver-for-dynamic-input)
- [5. Create a self paying task](#5-create-a-self-paying-task)
- [6. Manage your tasks](#6-manage-your-tasks)

  
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

## Examples  <!-- omit in toc -->

## 1. Create a task with pre-define input (run whenever possible)

- Use `gelatoOps.createTask` and specify your contract call with `execAddress`, `execSelector` & `execData`:
```ts
// Prepare Task data to automate
const counter = new Contract(COUNTER_ADDRESSES, counterAbi, signer);
const selector = counter.interface.getSighash("increaseCount(uint256)");
const data = counter.interface.encodeFunctionData("increaseCount", [42]);

// Create task
const res: TaskReceipt = await gelatoOps.createTask({
  execAddress: counter.address,
  execSelector: selector,
  execData: data,
  name: "Automated Counter with pre-defined input",
});
```

- Check the example source code [`examples/create-task-predefined-input.ts`](./examples/create-task-predefined-input.ts) and try it yourself using:
```
yarn run create-task-predefined-input --network rinkeby
```
<br/>


## 2. Create a task using a resolver contract

- Use `gelatoOps.createTask` and specify your resolver function with `resolverAddress` & `resolverData`:
```ts
// Prepare Task data to automate
const counter = new Contract(COUNTER_ADDRESSES, counterAbi, signer);
const resolver = new Contract(COUNTER_RESOLVER_ADDRESSES, counterResolverAbi, signer);
const selector = counter.interface.getSighash("increaseCount(uint256)");
const resolverData = resolver.interface.getSighash("checker()");

// Create task
const res: TaskReceipt = await gelatoOps.createTask({
  execAddress: counter.address,
  execSelector: selector,
  resolverAddress: resolver.address,
  resolverData: resolverData,
  name: "Automated counter using resolver",
});
```

- Check the example source code [`examples/create-task-with-resolver.ts`](./examples/create-task-with-resolver.ts) and try it yourself using:
```
yarn run create-task-with-resolver --network rinkeby
```
<br/>


## 3. Create a time based task

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
const res: TaskReceipt = await gelatoOps.createTask({
  execAddress: counter.address,
  execSelector: selector,
  execData,
  startTime, // starting timestamp in seconds
  interval, // execution interval in seconds
  name: "Automated counter every 5min",
});
```

- Check the example source code [`examples/create-timed-task.ts`](./examples/create-timed-task.ts) and try it yourself using:
```
yarn run create-timed-task --network rinkeby
```
<br/>


## 4. Create a time based task with a resolver for dynamic input

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
const res: TaskReceipt = await gelatoOps.createTask({
  execAddress: counter.address,
  execSelector: selector,
  resolverAddress: resolver.address,
  resolverData: resolverData,
  interval, // execution interval in seconds
  name: "Automated counter with resolver every 5min",
});
```

- Check the example source code [`examples/create-timed-task-with-resolver.ts`](./examples/create-timed-task-with-resolver.ts) and try it yourself using:
```
yarn run create-timed-task-with-resolver --network rinkeby
```
<br/>

## 5. Create a self paying task 

- Use `gelatoOps.createTask` and set `useTreasury: false` to let the task pay for itself:
```ts
// Prepare Task data to automate
const counter = new Contract(COUNTER_WITHOUT_TREASURY_ADDRESSES, counterAbi, signer);
const resolver = new Contract(COUNTER_RESOLVER_WITHOUT_TREASURY_ADDRESSES, counterResolverAbi, signer);
const selector = counter.interface.getSighash("increaseCount(uint256)");
const resolverData = resolver.interface.getSighash("checker()");

// Create task
console.log("Creating Task...");
const res: TaskReceipt = await gelatoOps.createTask({
  execAddress: counter.address,
  execSelector: selector,
  resolverAddress: resolver.address,
  resolverData: resolverData,
  useTreasury: false,
  name: "Automated Counter without treasury",
});
```

- Check the example source code [`examples/create-self-paying-task.ts`](./examples/create-self-paying-task.ts) and try it yourself using:
```
yarn run create-self-paying-task --network rinkeby
```
<br/>

## 6. Manage your tasks

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
