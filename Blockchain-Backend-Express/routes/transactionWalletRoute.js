import express from "express";
import {
  getWalletTransactions,
  getWalletTransactionByUserId,
  getWalletCountTransaction,
  getWalletBalanceByUserId,
  addWalletTransaction,
} from "../controllers/transactionWalletController.js";
// import { validateTokenMiddleware } from "../config/app.js";
import validateTokenMiddleware from "../middleware/validateToken.js";

const router = express.Router();

router.use(validateTokenMiddleware);

router.get("/", getWalletTransactions);
router.get("/userId/:userId", getWalletTransactionByUserId);
router.get("/count", getWalletCountTransaction);
router.get("/balance/:userId", getWalletBalanceByUserId);

router.post("/", addWalletTransaction);

export default router;
