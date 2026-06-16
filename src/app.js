const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());

const authRouter = require ('./routes/auth.routes');
const accountRouter = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.routes');


app.use('/api/accounts', accountRouter);
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionRoutes);

module.exports = app;



