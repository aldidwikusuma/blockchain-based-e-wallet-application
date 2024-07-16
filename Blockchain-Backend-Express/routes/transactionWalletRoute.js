import express from "express";
import {
  getWalletTransactions,
  getWalletTransactionByUserId,
  getCountWalletTransaction,
  getWalletBalanceByUserId,
  addWalletTransaction,
} from "../controllers/transactionWalletController.js";

import { validateTokenGeneral } from "../middleware/validateToken.js";

const router = express.Router();

router.use(validateTokenGeneral);

router.get("/", getWalletTransactions);
router.get("/userId/:userId", getWalletTransactionByUserId);
router.get("/count", getCountWalletTransaction);
router.get("/balance/:userId", getWalletBalanceByUserId);

router.post("/", addWalletTransaction);

export default router;
