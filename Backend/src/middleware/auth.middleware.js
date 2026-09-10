const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    console.log(req.headers.authorization);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized access, access token missing",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        const user = await userModel
            .findById(decoded.userId)
            .select("+role");

        if (!user) {
            return res.status(401).json({
                message: "User not found",
            });
        }

        req.user = user;

        next();

    } catch (err) {

        return res.status(401).json({
            message: "Unauthorized access, invalid or expired access token",
        });

    }
}

async function authSystemMiddleware(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized access, access token missing",
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        const user = await userModel
            .findById(decoded.userId)
            .select("+role");

        if (!user) {
            return res.status(401).json({
                message: "User not found",
            });
        }

        if (user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Forbidden. Admin access required.",
            });
        }

        req.user = user;

        next();

    } catch (err) {

        return res.status(401).json({
            message: "Unauthorized access, invalid or expired access token",
        });

    }

}

module.exports = {
    authMiddleware,
    authSystemMiddleware,
};