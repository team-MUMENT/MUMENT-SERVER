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
Object.defineProperty(exports, "__esModule", { value: true });
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const axios = require('axios').default;
/**
 * @DESC 클라에게 받은 authentication code로 토큰 발급 받기
 */
const getKakaoToken = (authenticationCode) => __awaiter(void 0, void 0, void 0, function* () {
    let kakaoToken = serviceReturnConstant_1.default.INVALID_AUTHENTICATION_CODE;
    try {
        yield axios({
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
        }).then((response) => {
            kakaoToken = response;
        }).catch((error) => {
            console.log('카카오 토큰 발급 실패');
            console.log(error);
            return serviceReturnConstant_1.default.INVALID_AUTHENTICATION_CODE;
        });
        return kakaoToken;
    }
    catch (error) {
        console.log('카카오 토큰 발급 에러');
        console.log(error);
        throw error;
    }
});
const getKakaoProfile = (kakaoAccessToken) => __awaiter(void 0, void 0, void 0, function* () {
    let kakaoProfile = serviceReturnConstant_1.default.INVALID_AUTHENTICATION_CODE;
    try {
        yield axios({
            method: 'post',
            url: 'https://kapi.kakao.com/v2/user/me',
            headers: {
                'Authorization': 'Bearer ' + kakaoAccessToken,
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }).then((response) => {
            kakaoProfile = response.data;
        }).catch((error) => {
            console.log('카카오 프로필 조회 실패: ');
            console.log(error);
            return serviceReturnConstant_1.default.INVALID_AUTHENTICATION_CODE;
        });
        return kakaoProfile;
    }
    catch (error) {
        console.log('카카오 프로필 조회 에러');
        console.log(error);
        throw error;
    }
});
/**
 * @DESC 카카오 연결끊기
 */
const unlinkKakao = (kakaoAccessToken) => __awaiter(void 0, void 0, void 0, function* () {
    let result = serviceReturnConstant_1.default.KAKAO_UNLINK_SUCCESS;
    try {
        yield axios({
            method: 'post',
            url: 'https://kapi.kakao.com/v1/user/unlink',
            headers: {
                'Authorization': 'Bearer ' + kakaoAccessToken,
            }
        }).catch((error) => {
            console.log('카카오 연결끊기 실패: ');
            console.log(error);
            result = serviceReturnConstant_1.default.KAKAO_UNLINK_FAIL;
        });
        return result;
    }
    catch (error) {
        console.log('카카오 연결끊기 에러');
        console.log(error);
        throw error;
    }
});
exports.default = {
    getKakaoToken,
    getKakaoProfile,
    unlinkKakao
};
//# sourceMappingURL=kakaoAuth.js.map