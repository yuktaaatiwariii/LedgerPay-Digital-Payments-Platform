const express = require('express');
const router = express.Router();
const {
    userRegisterController, 
    userLoginController,
    userLogoutController, 
    refreshAccessTokenController,
    forgotPasswordController,
    resetPasswordController
} = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { loginLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/register', userRegisterController );
router.post('/login', loginLimiter, userLoginController );
router.post("/refresh", refreshAccessTokenController);
router.post('/logout', userLogoutController );

router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordController);
router.post('/reset-password/:token', forgotPasswordLimiter, resetPasswordController);

router.get("/me",authMiddleware.authMiddleware, (req, res) => res.status(200).json({success:true,user:req.user}));

module.exports = router;