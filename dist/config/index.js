"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const envFound = dotenv_1.default.config();
// 개발용/릴리즈용 환경 구분
process.env.NODE_ENV = (process.env.NODE_ENV && (process.env.NODE_ENV).trim().toLowerCase() == 'production') ? 'production' : 'development';
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
    webhookReleaseURI: process.env.WEBHOOK_RELEASE_URI,
    webhookReportURI: process.env.WEBHOOK_REPORT_URI,
    /**
     *  RDS MySQL
     */
    // 개발용 DB
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    dbPort: parseInt(process.env.DB_PORT, 10),
    // 릴리즈용 DB
    hostProd: process.env.PRODUCTION_DB_HOST,
    userProd: process.env.PRODUCTION_DB_USER,
    passwordProd: process.env.PRODUCTION_DB_PASSWORD,
    databaseProd: process.env.PRODUCTION_DB_DATABASE,
    dbPortProd: parseInt(process.env.PRODUCTION_DB_PORT, 10),
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