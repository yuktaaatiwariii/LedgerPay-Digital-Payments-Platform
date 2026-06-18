const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const emailService = require('../services/email.service');
const accountModel = require('../models/account.model');
const mongoose = require("mongoose")

/***
 * - Create a new transaction
 *  the 10-STEP TRANSFER FLOW:
 * 1. validate request
 * 2. validate idempotency key
 * 3. check account status
 * 4. check sufficient balance from ledger
 * 5. create transaction status "pending"
 * 6. create DEBIT ledger entry
 * 7. create CREDIT ledger entry
 * 8. mark transation as "completed"
 * 9. commit MongoDB session 
 * 10. send email notification
 */

async function createTransaction(req, res) {

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    // 1. validate request

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const fromUserAccount = await accountModel.findOne({ _id: fromAccount,});
    const toUserAccount = await accountModel.findOne({ _id: toAccount,});

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({ error: "One or both accounts not found" });
    }

        // 2. validate idempotency key

    const existingTransaction = await transactionModel.findOne({
         idempotencyKey : idempotencyKey 
    });

    if (existingTransaction) {
       if(existingTransaction.status === "COMPLETED") {
            return res.status(200).json({
                 message: "Transaction already processed",
                  transaction: existingTransaction 
                });
       }

       if(existingTransaction.status === "PENDING") {
            return res.status(200).json({
                 message: "Transaction is still pending"
                });
       }

       if(existingTransaction.status === "FAILED") {
            return res.status(500).json({
                 message: "Transaction has failed ",
                });
       }

       if(existingTransaction.status === "REVERSED") {
            return res.status(500).json({
                 message: "Transaction has been reversed ",
                });
       }
    }

        // 3. check account status

        if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
            return res.status(400).json({
                 message: " Both accounts must be active to perform a transaction"
             });
        }

        // 4. check sufficient balance from ledger

        const balance = await fromUserAccount.getBalance();

        if (balance < amount) {
            return res.status(400).json({
                 message: "Insufficient balance in the account"
             });
        }

        // 5. create transaction status "pending"

        let transaction;
        try{

          const session = await mongoose.startSession()
        session.startTransaction()

        transaction = (await transactionModel.create([ {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        } ], { session }))[ 0 ]

        const debitLedgerEntry = await ledgerModel.create([ {
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        } ], { session })

        await (() => {
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
        })()

        const creditLedgerEntry = await ledgerModel.create([ {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        } ], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )

     await session.commitTransaction()
        session.endSession()


    } catch (error) {
    await session.abortTransaction();
    session.endSession();

      try {
        await emailService.sendTransactionFailedEmail(
            req.user.email,
            req.user.name,
            amount,
            toAccount,
        
        );
    } catch (emailError) {
        console.error("Failed to send failure email:", emailError);
    }

       return res.status(400).json({
            message: "Transaction failed",
            error: error.message
        })
    }

        // 10. send email notification
    try {
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })
  }  catch (error) {
    return res.status(500).json({
        message: "Transaction completed but failed to send email",
        error: error.message
    })
}}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([ {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    } ], { session })

    const creditLedgerEntry = await ledgerModel.create([ {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    } ], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })


} 

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}
