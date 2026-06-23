const express = require('express');
const app = express();
const cors = require("cors");


const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', // Adjust the origin as needed
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

const authRouter = require ('./routes/auth.routes');
const accountRouter = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.routes');


app.use('/api/accounts', accountRouter);
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionRoutes);

module.exports = app;



