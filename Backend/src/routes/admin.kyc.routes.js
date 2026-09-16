const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const { authSystemMiddleware } = require('../middleware/auth.middleware');

// All Admin KYC routes require admin authentication
router.use(authSystemMiddleware);

router.get('/', kycController.getKYCApplications);
router.get('/:id', kycController.getKYCApplicationById);
router.patch('/:id/approve', kycController.approveKYC);
router.patch('/:id/reject', kycController.rejectKYC);

module.exports = router;
