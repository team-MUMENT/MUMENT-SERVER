"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
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
//iOS client에서 받은 code를 이용해 apple token api 호출해서 로그인에 사용될 access, refresh 포함 토큰 얻기
const getAppleToken = (code) => __awaiter(void 0, void 0, void 0, function* () {
    return axios_1.default.post('https://appleid.apple.com/auth/token', 
    //body를 URL encoding해서 보냄
    qs.stringify({
        grant_type: 'authorization_code',
        code,
        client_secret: createSignWithAppleSecret(),
        client_id: process.env.APPLE_SERVICE_ID,
        redirect_uri: process.env.APPLE_REDIRECT_URI,
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
});
exports.default = {
    createSignWithAppleSecret,
    getAppleToken
};
//# sourceMappingURL=appleSignIn.js.map