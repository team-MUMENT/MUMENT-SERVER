"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require('jsonwebtoken');
const jsonwebtoken_1 = require("jsonwebtoken");
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const config_1 = __importDefault(require("../config"));
const accessOption = {
    expiresIn: '30d',
    issuer: 'Mument',
};
const refreshOption = {
    expiresIn: '60d',
    issuer: 'Mument',
};
// accessToken 발급 함수
const accessSign = (user) => {
    const payload = {
        id: user.id,
        profileId: user.profile_id,
        image: user.image
    };
    const accessToken = jwt.sign(payload, config_1.default.jwtSecret, accessOption);
    return accessToken;
};
// refreshToken 발급 함수
const refreshSign = (user) => {
    const payload = {
        id: user.id,
        profileId: user.profile_id,
        image: user.image
    };
    const refreshToken = jwt.sign(payload, config_1.default.jwtSecret, refreshOption);
    return refreshToken;
};
// 토큰 decode 함수
const verify = (token) => {
    try {
        const decoded = jwt.verify(token, config_1.default.jwtSecret);
        // 프로필 설정이 완료되지 않은 토큰일 때
        if (decoded.profileId === null)
            return serviceReturnConstant_1.default.NOT_PROFILE_SET_TOKEN;
        return decoded;
    }
    catch (err) {
        if (err.name == jsonwebtoken_1.TokenExpiredError) {
            // 토큰 만료
            console.log(err.message);
            return serviceReturnConstant_1.default.TOKEN_EXPIRED;
        }
        else if (err.message == 'invalid token') {
            // 유효하지 않은 토큰일 때
            console.log(err.message);
            return serviceReturnConstant_1.default.TOKEN_INVALID;
        }
        else if (err.message == 'jwt malformed' || 'jwt signature is required' || 'invalid signature') {
            console.log(err.message);
            return serviceReturnConstant_1.default.WRONG_TOKEN;
        }
        else if (err.name == jsonwebtoken_1.NotBeforeError) {
            // 리프레쉬 토큰 갱신 기간 전일 때
            console.log(err.message);
            return serviceReturnConstant_1.default.TOKEN_NOT_BEFORE;
        }
        else {
            // 그 외 토큰 에러
            console.log(err.message);
            return serviceReturnConstant_1.default.TOKEN_UNKNOWN_ERROR;
        }
    }
};
exports.default = {
    accessSign,
    refreshSign,
    verify
};
//# sourceMappingURL=jwtHandler.js.map