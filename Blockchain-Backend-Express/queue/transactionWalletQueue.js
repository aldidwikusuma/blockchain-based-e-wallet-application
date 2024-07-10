import Queue from "bull";
import{
  addTransaction,
} from "../services/transactionWalletService.js";

import dotenv from "dotenv";
import { consoleForDevelop } from "../config/app.js";

dotenv.config();

const transactionQueue = new Queue("wallet");

transactionQueue.process(5, async (job) => {
  const { data } = job;
  await addTransaction(data);
});

transactionQueue.on("failed", (job, err) => {
  console.error(`Job failed with error ${err.message}`);
});

export const addWalletTransactionToQueue = (data) => {
  consoleForDevelop("Add Transaction Process [Queue]");
  transactionQueue.add(data, { attempts: 3, backoff: 5000, priority: 1 });
};