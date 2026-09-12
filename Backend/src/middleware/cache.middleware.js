const { getRedisClient } = require('../config/redis.config');

const cacheDashboard = async (req, res, next) => {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
        return next();
    }

    const cacheKey = `dashboard:user:${userId}`;
    const client = getRedisClient();

    if (!client) {
        console.warn('Redis unavailable, bypassing cache for dashboard.');
        return next();
    }

    try {
        const cachedData = await client.get(cacheKey);
        if (cachedData) {
            console.log('Redis cache HIT for dashboard:', cacheKey);
            return res.json(JSON.parse(cachedData));
        }

        console.log('Redis cache MISS for dashboard:', cacheKey);
        
        // Intercept res.json to cache the response
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Cache for 60 seconds
                client.setEx(cacheKey, 60, JSON.stringify(body))
                    .catch(err => console.error('Redis dashboard cache error:', err));
            }
            originalJson(body);
        };

        next();
    } catch (err) {
        console.error('Cache middleware error:', err);
        // Fail-open: proceed to normal DB fetch if cache errors
        next();
    }
};

const invalidateDashboardCache = async (userId) => {
    const client = getRedisClient();
    if (!client) return;

    try {
        const cacheKey = `dashboard:user:${userId}`;
        await client.del(cacheKey);
        console.log('Dashboard cache invalidated for user:', userId);
    } catch (err) {
        console.error('Cache invalidation error:', err);
    }
};

module.exports = {
    cacheDashboard,
    invalidateDashboardCache
};
