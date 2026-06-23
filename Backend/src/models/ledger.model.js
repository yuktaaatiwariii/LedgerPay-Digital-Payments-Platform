const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,"Ledger entry must be associated with an account"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,"Ledger entry must have an amount"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'transaction',
        required:[true,"Ledger entry must be associated with a transaction"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["DEBIT","CREDIT"],
            message:"Ledger entry type must be either DEBIT or CREDIT"
        },
        required:[true,"Ledger entry must have a type"],
        immutable:true
    }
});

function preventledgerModification(){
    throw new Error("Ledger entries cannot be modified once created");
}

ledgerSchema.pre("findOneAndUpdate",preventledgerModification);
ledgerSchema.pre("updateOne",preventledgerModification);
ledgerSchema.pre("updateMany",preventledgerModification);
ledgerSchema.pre("update",preventledgerModification);
ledgerSchema.pre("deleteOne",preventledgerModification);
ledgerSchema.pre("deleteMany",preventledgerModification);
ledgerSchema.pre("findOneAndDelete",preventledgerModification);
ledgerSchema.pre("findOneAndRemove",preventledgerModification);
ledgerSchema.pre("findOneAndReplace",preventledgerModification);

const ledgerModel = mongoose.model("ledger",ledgerSchema);

module.exports = ledgerModel;
