const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary.config');

// All KYC routes require authentication
router.use(authMiddleware);

router.post('/', upload.single('document'), kycController.submitKYC);
router.get('/me', kycController.getMyKYC);
router.put('/resubmit', upload.single('document'), kycController.resubmitKYC);

module.exports = router;
