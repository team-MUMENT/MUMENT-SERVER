"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const qs = require('querystring');
require('dotenv').config();
/**
 * 인증키 생성 라이브러리
 * .env에 넣어야할 값 : APPLE_TEAM_ID, APPLE_SERVICE_ID, APPLE_KEY_ID,APPLE_REDIRECT_URI
 */
//secret key
const signWithApplePrivateKey = (_a = fs_1.default.readFileSync("src/config/apple/AuthKey.p8").toString()) !== null && _a !== void 0 ? _a : '';
//apple developer token(인증키) 생성 함수
const createSignWithAppleSecret = () => {
    const token = jsonwebtoken_1.default.sign({}, signWithApplePrivateKey, {
        algorithm: 'ES256',
        expiresIn: '180d',
        audience: 'https://appleid.apple.com',
        issuer: process.env.APPLE_TEAM_ID,
        subject: process.env.APPLE_SERVICE_ID,
        header: {
            alg: "ES256",
            kid: process.env.APPLE_KEY_ID
        },
    });
    return token;
};
exports.default = {
    createSignWithAppleSecret,
};
//# sourceMappingURL=appleSignIn.js.map