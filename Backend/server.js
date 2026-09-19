
require('dotenv').config();

const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis.config');


const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Connect to Redis BEFORE accepting requests
        await connectRedis();

        const app = require('./src/app');

        // Start Express only after Redis is ready
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

startServer();
