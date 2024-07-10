import { createContractInstance, sendRawTx } from "./web3Service.js";
import { consoleForDevelop } from "../config/app.js";

export const getAllWalletTransaction = async () => {
  consoleForDevelop("Get Transactions Process [Service]");
  const contract = await createContractInstance("wallet");
  const wallet = await contract.methods.getAllWalletTransactions().call();

  const mappedTransactions = wallet.map((wallet) => {
    return {
      userId: wallet.userId,
      amount: wallet.amount.toString(),
      transactionType: wallet.transactionType,
      status: wallet.status,
      code: wallet.code,
      createdAt: wallet.createdAt.toString(),
    };
  });

  consoleForDevelop("Transactions fetched successfully", "footer");
  return mappedTransactions;
};

export const addWalletTransaction = async (req) => {
  consoleForDevelop("Add Transaction Process [Service]");
  const {
    userId,
    amount,
    transactionType,
    status,
    code,
    createdAt,
  } = req;
  let arrayParams = [
    userId,
    amount,
    transactionType,
    status,
    code,
    createdAt,
  ];
  var response = await sendRawTx(arrayParams, "addWalletTransaction", "wallet");
  if (response.transactionHash) {
    consoleForDevelop(
      [
        "Transaction added successfully",
        "Transaction Hash: " + response.transactionHash,
      ],
      "footer"
    );
    return response.transactionHash;
  }
};

export const getWalletTransactionByUserId = async (userId) => {
  consoleForDevelop("Get Transaction by UserId Process [Service]");
  const contract = await createContractInstance("wallet");
  const wallet = await contract.methods
    .getWalletTransactionsByUserId(userId)
    .call();

  const mappedTransactions = wallet.map((wallet) => {
    return {
      userId: wallet.userId,
      amount: wallet.amount.toString(),
      transactionType: wallet.transactionType,
      status: wallet.status,
      code: wallet.code,
      createdAt: wallet.createdAt.toString(),
    };
  });

  consoleForDevelop("Transactions fetched successfully", "footer");
  return mappedTransactions;
};

export const getWalletCountTransaction = async () => {
  consoleForDevelop("Get Count Transaction Process [Service]");
  const contract = await createContractInstance("wallet");
  const count = await contract.methods.getWalletCountTransaction().call();
  consoleForDevelop("Transaction count fetched successfully", "footer");
  return count.toString();
};

export const getWalletBalanceByUserId = async (userId) => {
  consoleForDevelop("Get Balance by UserId Process [Service]");
  const contract = await createContractInstance("wallet");
  const balance = await contract.methods.getWalletBalanceByUserId(userId).call();
  consoleForDevelop("Balance fetched successfully", "footer");
  return balance.toString();
};