import { body } from "express-validator";

export const validateAddWalletTransaction = [
  body("userId").isString(),
  body("amount").isNumeric(),
  body("paymentMethodDetailId").isNumeric(),
  body("transactionType").isString(),
  body("status").isString(),
  body("code").isString(),
  body("createdAt").isNumeric(),
];
