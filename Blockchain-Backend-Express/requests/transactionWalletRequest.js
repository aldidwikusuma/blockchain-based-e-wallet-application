import { body } from "express-validator";

export const validateAddTransaction = [
  body("userId").isString(),
  body("amount").isNumeric(),
  body("transactionType").isString(),
  body("status").isString(),
  body("code").isString(),
  body("createdAt").isNumeric(),
];
