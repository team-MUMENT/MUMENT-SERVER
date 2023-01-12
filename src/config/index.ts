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
     * Connect to Slack with Webhook
     */
    webhookURI: process.env.WEBHOOK_URI as string,

    /**
     *  RDS MySQL
     */
    host: process.env.DB_HOST as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
    dbPort: parseInt(process.env.DB_PORT as string, 10) as number,

    /**
     * jwt Secret & Algorithm
     */
    jwtSecret: process.env.JWT_SECRET as string,
    jwtAlgo: process.env.JWT_ALGO as string,

    /**
     * S3 access key
     */
    s3AccessKey: process.env.S3_ACCESS_KEY as string,
    s3SecretKey: process.env.S3_SECRET_KEY as string,
    bucketName: process.env.BUCKET_NAME as string,
};