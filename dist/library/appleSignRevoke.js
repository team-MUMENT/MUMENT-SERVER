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
const axios_1 = __importDefault(require("axios"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const qs = require('qs');
require('dotenv').config();
const getAppleRefreshToken = (authorizationCode) => __awaiter(void 0, void 0, void 0, function* () {
    const data = {
        'client_id': process.env.APPLE_BUNDLE_ID,
        'client_secret': process.env.APPLE_DEVELOPER_TOKEN_NEW,
        'code': authorizationCode,
        'grant_type': 'authorization_code'
    };
    try {
        const result = yield axios_1.default.post('https://appleid.apple.com/auth/token', qs.stringify(data))
            .then(function (response) {
            return __awaiter(this, void 0, void 0, function* () {
                if (response.status == 200) {
                    return response.data.refresh_token;
                }
                else {
                    return null;
                }
            });
        })
            .catch(function (error) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('애플 토큰 얻기 error', error);
                return null;
            });
        });
        return result;
    }
    catch (error) {
        console.log("애플 리프레시 토큰 axios error", error);
        throw error;
    }
});
/**
 * 애플 탈퇴 시 연동 해제 - refreshToken 이용
 */
const appleSignRefreshRevoke = (authorizationCode) => __awaiter(void 0, void 0, void 0, function* () {
    const appleRefreshTokenResult = yield getAppleRefreshToken(authorizationCode);
    if (!appleRefreshTokenResult)
        return serviceReturnConstant_1.default.GET_APPLE_TOKEN_FAIL;
    const data = {
        'client_id': process.env.APPLE_BUNDLE_ID,
        'client_secret': process.env.APPLE_DEVELOPER_TOKEN_NEW,
        'token': appleRefreshTokenResult,
        'token_type_hint': 'refresh_token'
    };
    try {
        const resultConstant = yield axios_1.default.post('https://appleid.apple.com/auth/revoke', qs.stringify(data))
            .then(function (response) {
            return __awaiter(this, void 0, void 0, function* () {
                if (response.status == 200) {
                    return serviceReturnConstant_1.default.APPLE_SIGN_REVOKE_SUCCESS;
                }
                else {
                    return serviceReturnConstant_1.default.APPLE_SIGN_REVOKE_FAIL;
                }
            });
        })
            .catch(function (error) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('애플 탈퇴 연동 끊기 axios error', error);
                return serviceReturnConstant_1.default.APPLE_INTERNAL_SERVER_ERROR;
            });
        });
        return resultConstant;
    }
    catch (error) {
        console.log('애플 탈퇴 연동 끊기 error');
        console.log(error);
        throw error;
    }
});
exports.default = {
    getAppleRefreshToken,
    appleSignRefreshRevoke,
};
//# sourceMappingURL=appleSignRevoke.js.map