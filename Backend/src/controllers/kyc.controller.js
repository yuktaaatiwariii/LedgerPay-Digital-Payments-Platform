const KYC = require('../models/kyc.model');
const { cloudinary } = require('../config/cloudinary.config');

const submitKYC = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        
        // Check if a KYC application already exists and is pending or approved
        const existingKyc = await KYC.findOne({ userId });
        if (existingKyc) {
            if (existingKyc.status === 'PENDING') {
                return res.status(409).json({ message: 'KYC application already submitted and is pending review.' });
            }
            if (existingKyc.status === 'APPROVED') {
                return res.status(409).json({ message: 'KYC application is already approved.' });
            }
        }

        const { fullName, dateOfBirth, address, documentType } = req.body;
        
        if (!fullName || !dateOfBirth || !address || !documentType) {
            return res.status(400).json({ message: 'All KYC fields are required.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Document file is required.' });
        }

        const newKyc = new KYC({
            userId,
            fullName,
            dateOfBirth,
            address,
            documentType,
            documentUrl: req.file.path, // multer-storage-cloudinary populates path with secure_url
            cloudinaryPublicId: req.file.filename // multer-storage-cloudinary populates filename with public_id
        });

        await newKyc.save();

        return res.status(201).json({
            message: 'KYC submitted successfully.',
            kyc: newKyc
        });
    } catch (error) {
        // If MongoDB save fails, we should attempt to delete the uploaded Cloudinary asset
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cleanupError) {
                console.error("Cloudinary cleanup failed:", cleanupError);
            }
        }
        
        console.error('Submit KYC Error:', error);
        return res.status(500).json({ message: 'An error occurred while submitting KYC.' });
    }
};

const getMyKYC = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const kyc = await KYC.findOne({ userId }).select('-cloudinaryPublicId -__v');
        
        if (!kyc) {
            return res.status(404).json({ message: 'No KYC application found.' });
        }
        
        return res.status(200).json({ kyc });
    } catch (error) {
        console.error('Get My KYC Error:', error);
        return res.status(500).json({ message: 'An error occurred while retrieving KYC.' });
    }
};

const resubmitKYC = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        
        const existingKyc = await KYC.findOne({ userId });
        if (!existingKyc) {
            return res.status(404).json({ message: 'No KYC application found to resubmit.' });
        }
        
        if (existingKyc.status !== 'REJECTED') {
            return res.status(409).json({ message: 'You can only resubmit if your previous application was rejected.' });
        }

        const { fullName, dateOfBirth, address, documentType } = req.body;

        if (fullName) existingKyc.fullName = fullName;
        if (dateOfBirth) existingKyc.dateOfBirth = dateOfBirth;
        if (address) existingKyc.address = address;
        if (documentType) existingKyc.documentType = documentType;

        let oldCloudinaryId = null;

        // If a new file is provided, update the document info
        if (req.file) {
            oldCloudinaryId = existingKyc.cloudinaryPublicId;
            existingKyc.documentUrl = req.file.path;
            existingKyc.cloudinaryPublicId = req.file.filename;
        }

        existingKyc.status = 'PENDING';
        existingKyc.rejectionReason = null;
        existingKyc.submittedAt = Date.now();
        
        await existingKyc.save();

        // Cleanup old file from Cloudinary after successful DB update
        if (oldCloudinaryId) {
            try {
                await cloudinary.uploader.destroy(oldCloudinaryId);
            } catch (cleanupError) {
                console.error("Cloudinary old file cleanup failed:", cleanupError);
            }
        }

        return res.status(200).json({
            message: 'KYC resubmitted successfully.',
            kyc: existingKyc
        });
    } catch (error) {
        // Cleanup new file on error
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cleanupError) {
                console.error("Cloudinary cleanup failed:", cleanupError);
            }
        }
        
        console.error('Resubmit KYC Error:', error);
        return res.status(500).json({ message: 'An error occurred while resubmitting KYC.' });
    }
};

// Admin Controllers

const getKYCApplications = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        
        if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            query.status = status;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const applications = await KYC.find(query)
            .populate('userId', 'name email customerId')
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await KYC.countDocuments(query);
        
        return res.status(200).json({
            data: applications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get KYC Applications Error:', error);
        return res.status(500).json({ message: 'Failed to retrieve applications.' });
    }
};

const getKYCApplicationById = async (req, res) => {
    try {
        const application = await KYC.findById(req.params.id).populate('userId', 'name email customerId');
        if (!application) {
            return res.status(404).json({ message: 'KYC application not found.' });
        }
        return res.status(200).json({ application });
    } catch (error) {
        console.error('Get KYC Application By ID Error:', error);
        return res.status(500).json({ message: 'Failed to retrieve application.' });
    }
};

const approveKYC = async (req, res) => {
    try {
        const application = await KYC.findById(req.params.id);
        
        if (!application) {
            return res.status(404).json({ message: 'KYC application not found.' });
        }
        
        if (application.status !== 'PENDING') {
            return res.status(400).json({ message: `Cannot approve application with status ${application.status}.` });
        }
        
        application.status = 'APPROVED';
        application.reviewedAt = Date.now();
        application.reviewedBy = req.user._id || req.user.id;
        application.rejectionReason = null;
        
        await application.save();
        
        return res.status(200).json({
            message: 'KYC application approved successfully.',
            application
        });
    } catch (error) {
        console.error('Approve KYC Error:', error);
        return res.status(500).json({ message: 'Failed to approve application.' });
    }
};

const rejectKYC = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        
        if (!rejectionReason || !rejectionReason.trim()) {
            return res.status(400).json({ message: 'Rejection reason is required.' });
        }
        
        const application = await KYC.findById(req.params.id);
        
        if (!application) {
            return res.status(404).json({ message: 'KYC application not found.' });
        }
        
        if (application.status !== 'PENDING') {
            return res.status(400).json({ message: `Cannot reject application with status ${application.status}.` });
        }
        
        application.status = 'REJECTED';
        application.reviewedAt = Date.now();
        application.reviewedBy = req.user._id || req.user.id;
        application.rejectionReason = rejectionReason.trim();
        
        await application.save();
        
        return res.status(200).json({
            message: 'KYC application rejected successfully.',
            application
        });
    } catch (error) {
        console.error('Reject KYC Error:', error);
        return res.status(500).json({ message: 'Failed to reject application.' });
    }
};

module.exports = {
    submitKYC,
    getMyKYC,
    resubmitKYC,
    getKYCApplications,
    getKYCApplicationById,
    approveKYC,
    rejectKYC
};
