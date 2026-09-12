const { getRedisClient } = require('../config/redis.config');

const idempotencyMiddleware = async (req, res, next) => {
    const idempotencyKey = req.header('Idempotency-Key');
    if (!idempotencyKey) {
        return next();
    }

    const userId = req.user ? req.user._id : 'anonymous';
    const redisKey = `idempotency:${userId}:${idempotencyKey}`;
    const client = getRedisClient();

    if (!client) {
        // Fail closed for financial operations
        return res.status(503).json({ success: false, message: 'Service temporarily unavailable. Cannot guarantee idempotency.' });
    }

    try {
        const isNew = await client.setNX(redisKey, JSON.stringify({ state: 'PROCESSING' }));

        if (!isNew) {
            const existingStateStr = await client.get(redisKey);
            const existingState = JSON.parse(existingStateStr);

            if (existingState.state === 'PROCESSING') {
                return res.status(409).json({ success: false, message: 'Duplicate request is already processing.' });
            }

            if (existingState.state === 'COMPLETED') {
                console.log('Idempotency duplicate detected, returning cached response for key:', idempotencyKey);
                // Return cached response
                return res.status(existingState.statusCode || 200).json(existingState.body);
            }
        }

        console.log('Idempotency key created:', idempotencyKey);
        
        // Set an expiry of 24 hours for the idempotency key to avoid memory leak
        await client.expire(redisKey, 24 * 60 * 60);

        // Intercept response
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            const statusCode = res.statusCode;
            
            client.setEx(redisKey, 24 * 60 * 60, JSON.stringify({
                state: 'COMPLETED',
                statusCode,
                body
            })).catch(err => console.error('Redis idempotency update error:', err));
            
            originalJson(body);
        };

        next();
    } catch (err) {
        console.error('Idempotency middleware error:', err);
        return res.status(503).json({ success: false, message: 'Service temporarily unavailable.' });
    }
};

module.exports = { idempotencyMiddleware };
