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
const db_1 = __importDefault(require("../loaders/db"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const kakaoAuth_1 = __importDefault(require("../library/kakaoAuth"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtHandler_1 = __importDefault(require("../library/jwtHandler"));
const fs = require('fs');
const AppleAuth = require('apple-auth');
const path = require('path');
/**
* 로그인/회원가입
*/
const login = (provider, authenticationCode, fcm_token) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    // authentication code가 없는 경우
    if (!authenticationCode)
        return serviceReturnConstant_1.default.NO_AUTHENTICATION_CODE;
    try {
        yield connection.beginTransaction(); // 트랜잭션 적용 시작
        let user = undefined;
        let type = 'login'; // 회원가입이면 -> 'signUp' 재할당, 로그인이면 -> 'login'
        if (provider === 'kakao') {
            /**
             * 카카오 로그인/회원가입
             */
            // authentication code로 카카오 토큰 발급 받아오기
            const kakaoToken = yield kakaoAuth_1.default.getKakaoToken(authenticationCode);
            if (typeof kakaoToken === 'number')
                return serviceReturnConstant_1.default.INVALID_AUTHENTICATION_CODE; // 카카오 토큰 조회 실패시 반환
            // 카카오 토큰으로 프로필 조회
            const kakaoProfile = kakaoAuth_1.default.getKakaoProfile(kakaoToken);
            if (typeof kakaoToken === 'number')
                return serviceReturnConstant_1.default.INVALID_AUTHENTICATION_CODE; // 카카오 프로필 조회 실패시 반환
            // 해당 유저가 이미 가입한 유저인지 확인 - authentication_code 사용
            const findUserQuery = `
                SELECT *
                FROM user
                WHERE provider = ? AND authentication_code = ? AND is_deleted = 0;
            `;
            const findUserResult = yield connection.query(findUserQuery, ['kakao', authenticationCode]);
            user = findUserResult;
            // 회원가입이 필요한 유저인 경우
            if (findUserResult.length === 0) {
                type = 'signUp';
                // db에 유저 정보 insert
                const insertUserQuery = `
                    INSERT INTO user (provider, authentication_code, email, gender, age_range)
                    VALUE (?, ?, ?, ?, ?);
                `;
                yield connection.query(insertUserQuery, [
                    'kakao',
                    authenticationCode,
                    kakaoProfile.account_email,
                    kakaoProfile.gender,
                    kakaoProfile.age_range,
                ]);
                // 유저 insert 결과 조회
                const findUserAfterInsertResult = yield connection.query(findUserQuery, ['kakao', authenticationCode]);
                if (findUserAfterInsertResult.length === 0)
                    return serviceReturnConstant_1.default.NO_USER;
                user = findUserAfterInsertResult[0];
            }
            else {
                user = findUserResult[0];
            }
        }
        else if (provider === 'apple') {
            /**
             * 애플 로그인/회원가입
             */
            const id_token = jsonwebtoken_1.default.decode(authenticationCode);
            const email = id_token.email;
            const sub = id_token.sub;
            if (!sub || sub === undefined) {
                //id_token의 sub값이 없다면
                return serviceReturnConstant_1.default.NO_IDENTITY_TOKEN_SUB;
            }
            // 해당 유저가 이미 가입한 유저인지 확인 - sub 사용(유니크한 sub값으로 저장함)
            const findUserQuery = `
                SELECT *
                FROM user
                WHERE provider = ? AND authentication_code = ? AND is_deleted = 0;
            `;
            const findUserResult = yield connection.query(findUserQuery, ['apple', sub]);
            user = findUserResult;
            // 회원가입이 필요한 유저인 경우 - db에 유저 정보 insert
            if (findUserResult.length === 0) {
                type = 'signUp';
                const insertUserQuery = `
                    INSERT INTO user (provider, authentication_code, email)
                    VALUE (?, ?, ?);
                `;
                yield connection.query(insertUserQuery, [
                    'apple',
                    sub,
                    email
                ]);
                // 유저 insert 결과 조회(재사용)
                const findUserAfterInsertResult = yield connection.query(findUserQuery, ['apple', sub]);
                if (findUserAfterInsertResult.length === 0)
                    return serviceReturnConstant_1.default.NO_USER;
                user = findUserAfterInsertResult[0];
            }
            else {
                user = findUserResult[0];
            }
        }
        if (typeof user === 'undefined')
            return serviceReturnConstant_1.default.NO_USER;
        // jwt token 발급
        const accessToken = jwtHandler_1.default.accessSign(user);
        const refreshToken = jwtHandler_1.default.refreshSign(user);
        // 발급된 refresh token db에 update
        const updateTokenQuery = `
            UPDATE user
            SET refresh_token = ?, fcm_token = ?
            WHERE id = ? AND is_deleted = 0;
        `;
        yield connection.query(updateTokenQuery, [
            refreshToken,
            fcm_token === undefined ? null : fcm_token,
            user.id,
        ]);
        yield connection.commit();
        // 새로 발급한 jwt token과 유저 id, 로그인/회원가입 타입 return
        const data = {
            _id: user.id.toString(),
            type: type,
            accessToken,
            refreshToken,
        };
        return data;
    }
    catch (error) {
        console.log(error);
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
const getNewAccessToken = (userId, refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        const getRefreshTokenQuery = `
        SELECT *
        FROM user
        WHERE id = ?
            AND is_deleted = 0;
        `;
        const getRefreshTokenResult = yield connection.query(getRefreshTokenQuery, [userId]);
        // db에 저장된 refresh token이 리퀘스트의 토큰과 일치하지 않을 때
        if (getRefreshTokenResult[0].refresh_token != refreshToken)
            return serviceReturnConstant_1.default.WRONG_TOKEN;
        const user = getRefreshTokenResult[0];
        // 새로운 access token 발급
        const accessToken = jwtHandler_1.default.accessSign(user);
        const decoded = jwtHandler_1.default.verify(refreshToken);
        const beforeExp = decoded.exp - Date.now() / 1000;
        let newRefreshToken = null;
        let type = 'renew access token';
        // 남은 기간이 한달 이하면 새로운 refresh token 발급
        if (beforeExp < 60 * 60 * 24 * 30) {
            newRefreshToken = jwtHandler_1.default.refreshSign(user);
            type = 'renew access and refresh token';
            const updateNewTokenQuery = `
            UPDATE user
            SET refresh_token = ?
            WHERE id = ?
                AND is_deleted = 0;
            `;
            yield connection.query(updateNewTokenQuery, [newRefreshToken, userId]);
        }
        // 리턴할 refresh token
        const returnRefreshToken = newRefreshToken ? newRefreshToken : refreshToken;
        const data = {
            _id: user.id.toString(),
            type,
            accessToken,
            refreshToken: returnRefreshToken
        };
        return data;
    }
    catch (error) {
        console.log(error);
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.default = {
    login,
    getNewAccessToken,
};
//# sourceMappingURL=AuthService.js.map