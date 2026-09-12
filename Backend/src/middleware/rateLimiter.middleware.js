const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis.config');

const createLimiter = (options) => {
    return rateLimit({
        ...options,
        store: new RedisStore({
            sendCommand: (...args) => {
                const client = getRedisClient();
                if (!client) {
                    throw new Error('Redis not available');
                }
                return client.sendCommand(args);
            },
        }),
        passOnStoreError: true, // Enables fail-open behavior if Redis is down
        handler: (req, res, next, options) => {
            res.status(options.statusCode).json(options.message);
        },
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
};

const loginLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,
    message: { success: false, message: 'Too many requests. Please try again later.' },
});

const forgotPasswordLimiter = createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 3,
    message: { success: false, message: 'Too many requests. Please try again later.' },
});

const transactionLimiter = createLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 20,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    keyGenerator: (req) => {
        if (req.user) return req.user._id.toString();
        return req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    }
});

const generalLimiter = createLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 100,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    keyGenerator: (req) => {
        if (req.user) return req.user._id.toString();
        return req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    }
});

module.exports = {
    loginLimiter,
    forgotPasswordLimiter,
    transactionLimiter,
    generalLimiter
};
