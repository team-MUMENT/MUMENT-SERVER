import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
    // This error should crash whole process

    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
    /**
     * Your favorite port
     */
    port: parseInt(process.env.PORT as string, 10) as number,

    /**
     * 몽고디비 연결 임시 주석처리
     */
    // /**
    //  * MongoDB URI
    //  */
    // mongoURI: process.env.MONGODB_URI as string,

    /**
     * Connect to Slack with Webhook
     */
    webhookURI: process.env.WEBHOOK_URI as string,
};
