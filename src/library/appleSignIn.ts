import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from "fs";
const qs = require('querystring');
require('dotenv').config();

/**
 * 인증키 생성 라이브러리
 * .env에 넣어야할 값 : APPLE_SCRET_KEY, APPLE_TEAM_ID, APPLE_SERVICE_ID, APPLE_KEY_ID,APPLE_REDIRECT_URI
 */

//secret key 가져오기
const signWithApplePrivateKey = fs.readFileSync("src/config/apple/AuthKey.p8").toString() ?? '';


//인증키 만드는 함수
// const createSignWithAppleSecret = () => {
//   const token = jwt.sign({}, signWithApplePrivateKey, {
//     algorithm: 'ES256',
//     expiresIn: '1h',
//     audience: 'https://appleid.apple.com',
//     issuer: process.env.APPLE_TEAM_ID as string,
//     subject: process.env.APPLE_SERVICE_ID as string,
//     keyid: process.env.APPLE_KEY_ID as string,
//   });

//   return token;
// };
const createSignWithAppleSecret = () => {
  const token = jwt.sign({}, signWithApplePrivateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',
    audience: 'https://appleid.apple.com',
    issuer: process.env.APPLE_TEAM_ID as string,
    subject: process.env.APPLE_SERVICE_ID as string,
    header: {
      alg: "ES256",
      kid: process.env.APPLE_KEY_ID as string
    }
  });

  return token;
};


//클라에서 받은 code를 이용해 apple token api 호출해서 로그인에 사용될 access, refresh 포함 토큰 얻기
const getAppleToken = async (code: string) => {
  return axios.post('https://appleid.apple.com/auth/token',
  //body를 URL encoding해서 보냄
    qs.stringify({
      grant_type: 'authorization_code',
      code,
      client_secret: createSignWithAppleSecret(),
      client_id: process.env.APPLE_SERVICE_ID,
      redirect_uri: process.env.APPLE_REDIRECT_URI,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
};

export default {
    createSignWithAppleSecret,
    getAppleToken
};