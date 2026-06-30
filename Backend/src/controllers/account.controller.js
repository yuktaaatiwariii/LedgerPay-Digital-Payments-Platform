const accountModel = require('../models/account.model');
const transactionModel = require("../models/transaction.model");

async function createAccountController(req, res) {
    
    const user = req.user;
     const { type } = req.body;
    

    const account = await accountModel.create({
        user :user._id,
         type:type
    });
    res.status(201).json({
        account,
      accountType : account.type
    })
}

async function getAllAccountsController(req, res) {
   
   const accounts = await accountModel.find({ user: req.user._id });
   res.status(200).json({
       accounts
   })
} 

 
async function getAccountBalanceController(req, res) {
    const {accountId} = req.params ;

  

    const account = await accountModel
     .findOne ({_id: accountId ,
        user: req.user._id});

    

    if (!account) {
        return res.status(404).json({ message: 'Account not found' });
    }

    const balance = await account.getBalance();

   

    res.status(200).json({
        balance
    });
}

async function getAccountSummaryController(req,res){
try {
    const userId = req.user._id;
    

    // Get all accounts of logged in user
    const accounts = await accountModel.find({ user: userId });

    const accountIds = accounts.map(account => account._id);

    // Total balance
   let totalBalance = 0;

for (const account of accounts) {
  const balance = await account.getBalance();
  totalBalance += balance;
}

    // First day of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Transactions of this month
    const transactions = await transactionModel.find({
      createdAt: { $gte: startOfMonth },
      status: "COMPLETED",
      $or: [
        { fromAccount: { $in: accountIds } },
        { toAccount: { $in: accountIds } }
      ]
    });

    let totalCredit = 0;
    let totalDebit = 0;

    transactions.forEach((transaction) => {

      // Money received
      if (accountIds.some(id => id.equals(transaction.toAccount))) {
        totalCredit += transaction.amount;
      }

      // Money sent
      if (accountIds.some(id => id.equals(transaction.fromAccount))) {
        totalDebit += transaction.amount;
      }

    });

    res.status(200).json({
      totalAccounts: accounts.length,
      totalBalance,
      totalCredit,
      totalDebit,
      totalTransactions: transactions.length,
      
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch account summary"
    });
  }
}



module.exports = {
    createAccountController , 
    getAllAccountsController,
    getAccountBalanceController,
    getAccountSummaryController
}
