const {Router} = require('express');
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middleware/auth.middleware');

const transactionRoutes = Router();

// -POOST /api/transaction
// create a new transaction

transactionRoutes.post("/", authMiddleware, transactionController.createTransaction);



module.exports = transactionRoutes;