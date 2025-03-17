// src/routes/withdrawalRoutes.ts
import { Router } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../middleware/auth.middleware";

import {
  withdrawToExternalWallet,
  withdrawToBank,
} from "../controllers/transactionController";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Withdrawals
 *   description: Token withdrawal endpoints
 */

/**
 * @swagger
 * /api/withdrawals/wallet:
 *   post:
 *     summary: Withdraw tokens to external wallet
 *     description: Transfer tokens from user's custodial wallet to an external wallet
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tiktokUsername
 *               - destinationWallet
 *               - amount
 *             properties:
 *               tiktokUsername:
 *                 type: string
 *                 description: User's TikTok username
 *               destinationWallet:
 *                 type: string
 *                 description: Destination wallet address
 *               amount:
 *                 type: number
 *                 description: Amount to withdraw
 *     responses:
 *       200:
 *         description: Withdrawal completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 transactionId:
 *                   type: string
 *                 from:
 *                   type: object
 *                 to:
 *                   type: object
 *                 amount:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       400:
 *         description: Invalid request or insufficient balance
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  "/wallet",
  authMiddleware,
  [
    body("tiktokUsername")
      .matches(/^@?[a-zA-Z0-9_.]{1,24}$/)
      .withMessage("Invalid TikTok username format"),
    body("destinationWallet")
      .matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
      .withMessage("Invalid Solana wallet address format"),
    body("amount")
      .isNumeric()
      .withMessage("Amount must be a number")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be greater than 0"),
  ],
  withdrawToExternalWallet
);

/**
 * @swagger
 * /api/withdrawals/bank:
 *   post:
 *     summary: Withdraw tokens to bank account
 *     description: Transfer tokens from user's wallet to their bank account
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tiktokUsername
 *               - bankDetails
 *               - amount
 *             properties:
 *               tiktokUsername:
 *                 type: string
 *                 description: User's TikTok username
 *               bankDetails:
 *                 type: object
 *                 properties:
 *                   accountName:
 *                     type: string
 *                   accountNumber:
 *                     type: string
 *                   bankName:
 *                     type: string
 *                   routingNumber:
 *                     type: string
 *               amount:
 *                 type: number
 *                 description: Amount to withdraw
 *     responses:
 *       200:
 *         description: Withdrawal request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reference:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       400:
 *         description: Invalid request or insufficient balance
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  "/bank",
  authMiddleware,
  [
    body("tiktokUsername")
      .matches(/^@?[a-zA-Z0-9_.]{1,24}$/)
      .withMessage("Invalid TikTok username format"),
    body("amount")
      .isNumeric()
      .withMessage("Amount must be a number")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be greater than 0"),
    body("bankDetails")
      .isObject()
      .withMessage("Bank details must be an object"),
    body("bankDetails.accountName")
      .isString()
      .notEmpty()
      .withMessage("Account name is required"),
    body("bankDetails.accountNumber")
      .isString()
      .notEmpty()
      .withMessage("Account number is required"),
    body("bankDetails.bankName")
      .isString()
      .notEmpty()
      .withMessage("Bank name is required"),
  ],
  withdrawToBank
);

export default router;
