import dotenv from 'dotenv';

const envFound = dotenv.config();


// 개발용/릴리즈용 환경 구분
process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';


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
<<<<<<< HEAD
    webhookURI: process.env.WEBHOOK_URI as string,
=======
    webhookURI: process.env.WEBHOOK_URI as string, //개발용 웹훅
    webhookReleaseURI: process.env.WEBHOOK_RELEASE_URI as string, //릴리즈용 웹훅

    webhookReportURI: process.env.WEBHOOK_REPORT_URI as string, //신고 접수 웹훅

>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557

    /**
     *  RDS MySQL
     */
<<<<<<< HEAD
=======
    // 개발용 DB
>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557
    host: process.env.DB_HOST as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
    dbPort: parseInt(process.env.DB_PORT as string, 10) as number,

<<<<<<< HEAD
=======
    // 릴리즈용 DB
    hostProd: process.env.PRODUCTION_DB_HOST as string,
    userProd: process.env.PRODUCTION_DB_USER as string,
    passwordProd: process.env.PRODUCTION_DB_PASSWORD as string,
    databaseProd: process.env.PRODUCTION_DB_DATABASE as string,
    dbPortProd: parseInt(process.env.PRODUCTION_DB_PORT as string, 10) as number,


>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557
    /**
     * jwt Secret & Algorithm
     */
    jwtSecret: process.env.JWT_SECRET as string,
    jwtAlgo: process.env.JWT_ALGO as string,

<<<<<<< HEAD
=======

>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557
    /**
     * S3 access key
     */
    s3AccessKey: process.env.S3_ACCESS_KEY as string,
    s3SecretKey: process.env.S3_SECRET_KEY as string,
    bucketName: process.env.BUCKET_NAME as string,

<<<<<<< HEAD
=======

>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557
    /**
     * Push alarm
     */
    noticePushAlarmImage: process.env.NOTICE_PUSH_ALARM_IMAGE as string,
    likePushAlarmImage: process.env.LIKE_PUSH_ALARM_IMAGE as string,

<<<<<<< HEAD
=======

>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557
    /**
     * apple music
     */
    appleDeveloperToken: process.env.APPLE_DEVELOPER_TOKEN as string,
};