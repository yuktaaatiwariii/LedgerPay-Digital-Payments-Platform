const express = require('express');
const router = express.Router();
const {userRegisterController, userLoginController,userLogoutController, refreshAccessTokenController} = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');


router.post('/register', userRegisterController );
router.post('/login', userLoginController );
router.post("/refresh", refreshAccessTokenController);
router.post('/logout', userLogoutController );

router.get("/me",authMiddleware.authMiddleware, (req, res) => res.status(200).json({success:true,user:req.user}));

module.exports = router;