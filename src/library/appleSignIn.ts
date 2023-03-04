import jwt from 'jsonwebtoken';
import fs from "fs";
const qs = require('querystring');
require('dotenv').config();

/**
 * 인증키 생성 라이브러리
 * .env에 넣어야할 값 : APPLE_TEAM_ID, APPLE_SERVICE_ID, APPLE_KEY_ID,APPLE_REDIRECT_URI
 */

//secret key
const signWithApplePrivateKey = fs.readFileSync("src/config/apple/AuthKey.p8").toString() ?? '';


//apple developer token(인증키) 생성 함수
const createSignWithAppleSecret = () => {
  const token = jwt.sign({}, signWithApplePrivateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',
    audience: 'https://appleid.apple.com',
    issuer: process.env.APPLE_TEAM_ID as string,
    subject: process.env.APPLE_BUNDLE_ID as string,
    header: {
      alg: "ES256",
      kid: process.env.APPLE_KEY_ID as string
    },
  });

  return token;
};


export default {
    createSignWithAppleSecret,
};