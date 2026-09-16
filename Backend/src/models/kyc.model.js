const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true
    },

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    dateOfBirth: {
        type: Date,
        required: true
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    documentType: {
        type: String,
        enum: [
            "AADHAAR",
            "PAN",
            "PASSPORT",
            "DRIVING_LICENSE",
            "VOTER_ID"
        ],
        required: true
    },

    documentUrl: {
        type: String,
        required: true
    },

    cloudinaryPublicId: {
        type: String,
        required: true
    },

    documentResourceType: {
        type: String
    },

    status: {
        type: String,
        enum: [
            "PENDING",
            "APPROVED",
            "REJECTED"
        ],
        default: "PENDING",
        index: true
    },

    rejectionReason: {
        type: String,
        default: null
    },

    submittedAt: {
        type: Date,
        default: Date.now
    },

    reviewedAt: {
        type: Date,
        default: null
    },

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, {
    timestamps: true
});

const KYC = mongoose.model('KYC', kycSchema);

module.exports = KYC;
