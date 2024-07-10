import { validationResult } from "express-validator";

// service
import {
  getAllTransaction as getAllTransactionService,
  addTransaction as addTransactionService,
  getTransactionByUserId as getTransactionByUserIdService,
  getCountTransaction as getCountTransactionService,
  getBalanceByUserId as getBalanceByUserIdService,
} from "../services/transactionService.js";

// request validation
import { validateAddTransaction } from "../requests/transactionRequest.js";

// queue
import { addTransactionToQueue } from "../queue/transactionQueue.js";
import { consoleForDevelop } from "../config/app.js";

// GET
export const getWalletTransactions = async (req, res) => {
  consoleForDevelop("Get Transactions Process [Controller]", "header");
  try {
    const transactions = await getAllTransactionService();
    if (transactions.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    return res.status(200).json({
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getWalletTransactionByUserId = async (req, res) => {
  consoleForDevelop("Get Transaction by UserId Process [Controller]", "header");
  try {
    const transactions = await getTransactionByUserIdService(req.params.userId);
    if (transactions.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    return res.status(200).json({
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions by userId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getWalletCountTransaction = async (req, res) => {
  consoleForDevelop("Get Count Transaction Process [Controller]", "header");
  try {
    const count = await getCountTransactionService();
    return res.status(200).json({
      message: "Transaction count fetched successfully",
      data: count,
    });
  } catch (error) {
    console.error("Error fetching transaction count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST
export const addWalletTransaction = async (req, res) => {
  consoleForDevelop("Add Transaction Process [Controller]", "header");
  try {
    consoleForDevelop("Validating transaction data [Controller]");
    await Promise.all(
      validateAddTransaction.map((validator) => validator.run(req))
    );
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      userId,
      amount,
      transactionType,
      status,
      code,
      createdAt,
    } = req.body;

    await addTransactionService({
      userId,
      amount,
      transactionType,
      status,
      code,
      createdAt,
    });

    addTransactionToQueue(req.body);
    return res.status(200).json({
      message: "Transaction add in progress...",
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getWalletBalanceByUserId = async (req, res) => {
  consoleForDevelop("Get Balance by UserId Process [Controller]", "header");
  try {
    const balance = await getBalanceByUserIdService(req.params.userId);
    return res.status(200).json({
      message: "Balance fetched successfully",
      data: balance,
    });
  } catch (error) {
    console.error("Error fetching balance by userId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};