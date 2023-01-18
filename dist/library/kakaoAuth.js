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
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require('axios').default;
/**
 * @DESC 클라에게 받은 authentication code로 토큰 발급 받기
 */
const getKakaoToken = (authenticationCode) => __awaiter(void 0, void 0, void 0, function* () {
    return axios({
        method: 'post',
        url: 'https://kauth.kakao.com/oauth/token',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        data: {
            'grant_type': 'authorization_code',
            'client_id': process.env.REST_API_APP_KEY,
            'redirect_uri': process.env.REDIRECT_URI,
            'code': authenticationCode
        }
    });
});
const getKakaoProfile = (kakaoAccessToken) => {
    return axios({
        method: 'post',
        url: 'https://kapi.kakao.com/v2/user/me',
        headers: {
            'Authorization': 'Bearer ' + kakaoAccessToken,
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    });
};
exports.default = {
    getKakaoToken,
    getKakaoProfile
};
//# sourceMappingURL=kakaoAuth.js.map