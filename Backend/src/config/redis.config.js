const { createClient } = require('redis');

let redisClient = null;

const connectRedis = async () => {
    try {
        const client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        client.on('error', (err) => {
            console.error('Redis connection error:', err);
        });

        client.on('connect', () => {
            console.log('Redis connected successfully.');
        });

        client.on('reconnecting', () => {
            console.log('Redis reconnecting...');
        });

        client.on('ready', () => {
            console.log('Redis client is ready.');
        });

        await client.connect();
        redisClient = client;
        return client;
    } catch (err) {
        console.error('Failed to initialize Redis:', err);
        // Do not crash the application, return null or handle gracefully in middlewares
        return null;
    }
};

const getRedisClient = () => {
    if (!redisClient || !redisClient.isReady) {
        console.warn('Redis client is not ready.');
        return null;
    }

    return redisClient;
};

module.exports = {
    connectRedis,
    getRedisClient
};
