const express = require('express');
const app = express();
const cors = require("cors");


const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());
const { generalLimiter } = require('./middleware/rateLimiter.middleware');
app.use('/api', generalLimiter);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Uses env var or defaults to local dev
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

const authRouter = require ('./routes/auth.routes');
const accountRouter = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.routes');
const kycRoutes = require('./routes/kyc.routes');
const adminKycRoutes = require('./routes/admin.kyc.routes');


app.use('/api/accounts', accountRouter);
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin/kyc', adminKycRoutes);

module.exports = app;



