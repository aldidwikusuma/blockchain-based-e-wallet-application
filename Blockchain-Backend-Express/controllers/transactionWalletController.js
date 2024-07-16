import { validationResult } from "express-validator";

// service
import {
  getAllWalletTransaction as getAllWalletTransactionService,
  addWalletTransaction as addWalletTransactionService,
  getWalletTransactionByUserId as getWalletTransactionByUserIdService,
  getCountWalletTransaction as getCountWalletTransactionService,
  getWalletBalanceByUserId as getWalletBalanceByUserIdService,
} from "../services/transactionWalletService.js";

// request validation
import { validateAddWalletTransaction } from "../requests/transactionWalletRequest.js";

// queue
import { addWalletTransactionToQueue } from "../queue/transactionWalletQueue.js";
import { consoleForDevelop } from "../config/app.js";

// GET
export const getWalletTransactions = async (req, res) => {
  consoleForDevelop("Get Wallet Transactions Process [Controller]", "header");
  try {
    const transactions = await getAllWalletTransactionService();
    if (transactions.length === 0) {
      return res.status(404).json({ error: "Wallet transaction not found" });
    }
    return res.status(200).json({
      message: "Wallet transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getWalletTransactionByUserId = async (req, res) => {
  consoleForDevelop("Get Transaction by UserId Process [Controller]", "header");
  try {
    const transactions = await getWalletTransactionByUserIdService(req.params.userId);
    if (transactions.length === 0) {
      return res.status(404).json({ error: "Wallet transaction not found" });
    }
    return res.status(200).json({
      message: "Wallet transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions by userId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCountWalletTransaction = async (req, res) => {
  consoleForDevelop("Get Count Wallet Transaction Process [Controller]", "header");
  try {
    const count = await getCountWalletTransactionService();
    return res.status(200).json({
      message: "Wallet transaction count fetched successfully",
      data: count,
    });
  } catch (error) {
    console.error("Error fetching wallet transaction count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST
export const addWalletTransaction = async (req, res) => {
  consoleForDevelop("Add Wallet Transaction Process [Controller]", "header");
  try {
    consoleForDevelop("Validating wallet transaction data [Controller]");
    await Promise.all(
      validateAddWalletTransaction.map((validator) => validator.run(req))
    );
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      userId,
      amount,
      paymentMethodDetailId,
      transactionType,
      status,
      code,
      createdAt,
    } = req.body;

    await addWalletTransactionService({
      userId,
      amount,
      paymentMethodDetailId,
      transactionType,
      status,
      code,
      createdAt,
    });

    addWalletTransactionToQueue (req.body);
    return res.status(200).json({
      message: "Wallet transaction add in progress...",
    });
  } catch (error) {
    console.error("Error adding wallet transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getWalletBalanceByUserId = async (req, res) => {
  consoleForDevelop("Get Balance by UserId Process [Controller]", "header");
  try {
    const balance = await getWalletBalanceByUserIdService(req.params.userId);
    return res.status(200).json({
      message: "Balance fetched successfully",
      data: balance,
    });
  } catch (error) {
    console.error("Error fetching balance by userId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};