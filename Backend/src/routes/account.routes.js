const express = require('express');

const authMiddleware = require('../middleware/auth.middleware');
const accountController = require('../controllers/account.controller');
const { cacheDashboard } = require('../middleware/cache.middleware');

const router = express.Router();

/**
 * POST /api/accounts/
 * create a new account 
 * - protected route
 */

router.post('/', authMiddleware.authMiddleware, accountController.createAccountController);

/**
 * GET /api/accounts/
 * get all accounts of all the logged in user
 * - protected route 
 */

router.get('/', authMiddleware.authMiddleware, accountController.getAllAccountsController);

/**
 * -GET /api/accounts/balance/:accountId
 */

router.get('/balance/:accountId', authMiddleware.authMiddleware, accountController.getAccountBalanceController);


/**
 *  -GET /api/accounts/getSummary
 */

router.get("/getSummary",authMiddleware.authMiddleware, cacheDashboard, accountController.getAccountSummaryController);




module.exports = router; 

