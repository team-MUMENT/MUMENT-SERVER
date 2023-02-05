"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config_1 = __importDefault(require("../config"));
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: config_1.default.s3AccessKey,
    secretAccessKey: config_1.default.s3SecretKey,
    region: 'ap-northeast-2'
});
exports.default = s3;
//# sourceMappingURL=s3Config.js.map