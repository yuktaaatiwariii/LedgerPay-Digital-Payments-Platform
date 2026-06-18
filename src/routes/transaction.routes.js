const {Router} = require('express');
const transactionController = require('../controllers/transaction.controller')
const authMiddleware = require('../middleware/auth.middleware');

const transactionRoutes = Router();

// -POOST /api/transaction
// create a new transaction

transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction);

// -POST /api/transactions/system/initial-funds
// create initial funds transaction for a user



transactionRoutes.post("/system/initial-funds", authMiddleware.authSystemMiddleware, transactionController.createInitialFundsTransaction);

module.exports = transactionRoutes;