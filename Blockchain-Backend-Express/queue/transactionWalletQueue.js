// import Queue from "bull";
// import{
//   addWalletTransaction,
// } from "../services/transactionWalletService.js";

// import dotenv from "dotenv";
// import { consoleForDevelop } from "../config/app.js";

// dotenv.config();

// const walletQueue = new Queue("wallet");

// walletQueue.process(5, async (job) => {
//   const { data } = job;
//   await addWalletTransaction(data);
// });

// walletQueue.on("failed", (job, err) => {
//   console.error(`Job failed with error ${err.message}`);
// });

// export const addWalletTransactionToQueue = async (data) => {
//   consoleForDevelop("Add Wallet Transaction Process [Queue]");
//   try {
//     console.log("Adding wallet transaction to queue:", data);
//     await walletQueue.add(data, { attempts: 3, backoff: 5000, priority: 1 });
//   } catch (error) {
//     console.error("Error adding wallet transaction to queue:", error);
//     throw error; // Rethrow the error to handle it in the controller
//   }
// };

import Queue from "bull";
import { addWalletTransaction } from "../services/transactionWalletService.js";
import dotenv from "dotenv";
import { consoleForDevelop } from "../config/app.js";

dotenv.config();

console.log('Redis Host:', process.env.REDIS_HOST);
console.log('Redis Port:', process.env.REDIS_PORT);

// Konfigurasi koneksi Redis
const redisOptions = {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379
  }
};

// Membuat instance Bull Queue dengan konfigurasi Redis
const walletQueue = new Queue("wallet", redisOptions);

walletQueue.process(5, async (job) => {
  const { data } = job;
  await addWalletTransaction(data);
});

walletQueue.on("failed", (job, err) => {
  console.error(`Job failed with error ${err.message}`);
});

export const addWalletTransactionToQueue = async (data) => {
  consoleForDevelop("Add Wallet Transaction Process [Queue]");
  try {
    console.log("Adding wallet transaction to queue:", data);
    await walletQueue.add(data, { attempts: 3, backoff: 5000, priority: 1 });
  } catch (error) {
    console.error("Error adding wallet transaction to queue:", error);
    throw error; // Rethrow the error to handle it in the controller
  }
};
