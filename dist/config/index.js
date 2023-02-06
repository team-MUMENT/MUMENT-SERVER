"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const envFound = dotenv_1.default.config();
if (envFound.error) {
    // This error should crash whole process
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
exports.default = {
    /**
     * Your favorite port
     */
    port: parseInt(process.env.PORT, 10),
    /**
     * Connect to Slack with Webhook
     */
    webhookURI: process.env.WEBHOOK_URI,
    /**
     *  RDS MySQL
     */
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    dbPort: parseInt(process.env.DB_PORT, 10),
    /**
     * jwt Secret & Algorithm
     */
    jwtSecret: process.env.JWT_SECRET,
    jwtAlgo: process.env.JWT_ALGO,
    /**
     * S3 access key
     */
    s3AccessKey: process.env.S3_ACCESS_KEY,
    s3SecretKey: process.env.S3_SECRET_KEY,
    bucketName: process.env.BUCKET_NAME,
    /**
     * Push alarm
     */
    noticePushAlarmImage: process.env.NOTICE_PUSH_ALARM_IMAGE,
    likePushAlarmImage: process.env.LIKE_PUSH_ALARM_IMAGE,
    /**
     * apple music
     */
    appleDeveloperToken: process.env.APPLE_DEVELOPER_TOKEN,
};
//# sourceMappingURL=index.js.map