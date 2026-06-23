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

// -GET /api/transactions/history
// get transaction history for a user

transactionRoutes.get("/history/:accountId", authMiddleware.authMiddleware, transactionController.getTransactionHistory);

// -GET /api/transactions/getAllAccounts 
// get all accounts of all users 

transactionRoutes.get("/getAllAccounts",authMiddleware.authSystemMiddleware,transactionController.getAllAccounts);

// -GET /api/transactions/viewAllUsers
// get all users 

transactionRoutes.get("/viewAllUsers",authMiddleware.authSystemMiddleware,transactionController.viewAllUsers);

module.exports = transactionRoutes;