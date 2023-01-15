import pools from '../modules/pool';
import poolPromise from '../loaders/db'

import { AuthTokenResponseDto } from '../interfaces/auth/AuthTokenResponseDto';
import constant from '../modules/serviceReturnConstant';
import { UserInfoRDB } from '../interfaces/user/UserInfoRDB';

import kakaoAuth from '../library/kakaoAuth';
import { AppleResponseDto } from '../interfaces/auth/AppleResponseDto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwtHandler from '../library/jwtHandler';
import appleSignIn from '../library/appleSignIn';

const fs = require('fs');
const AppleAuth = require('apple-auth');
const path = require('path');



/**
* 로그인/회원가입
*/
const login = async (provider: string, authenticationCode: string): Promise<AuthTokenResponseDto | number> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();
    
    // authentication code가 없는 경우
    if (!authenticationCode) return constant.NO_AUTHENTICATION_CODE;

    try {
        let user: UserInfoRDB | undefined = undefined;
        let type: string = 'login'; // 회원가입이면 -> 'signUp' 재할당, 로그인이면 -> 'login'
            

        if (provider === 'kakao') {
            /**
             * 카카오 로그인/회원가입
             */

            // authentication code로 카카오 토큰 발급 받아오기
            const kakaoToken: Promise<string> = kakaoAuth.getKakaoToken(authenticationCode);
            
            // 카카오 토큰으로 프로필 조회
            const kakaoProfile = kakaoAuth.getKakaoProfile(await kakaoToken);

            // 해당 유저가 이미 가입한 유저인지 확인 - authentication_code 사용
            const findUserQuery = `
                SELECT *
                FROM user
                WHERE provider = ? AND authentication_code = ? AND is_deleted = 0;
            `;
            const findUserResult = await connection.query(findUserQuery, ['kakao', authenticationCode]);
            user = findUserResult;

            // 회원가입이 필요한 유저인 경우
            if (findUserResult.length === 0) {
                type = 'signUp';

                // db에 유저 정보 insert
                const insertUserQuery = `
                    INSERT INTO user (provider, authentication_code, email, gender, age_range)
                    VALUE (?, ?, ?, ?, ?);
                `;

                await connection.query(insertUserQuery, [
                    'kakao',
                    authenticationCode, 
                    kakaoProfile.account_email,
                    kakaoProfile.gender,
                    kakaoProfile.age_range,
                ]);

                // 유저 insert 결과 조회
                const findUserAfterInsertResult = await connection.query(findUserQuery, ['kakao', authenticationCode]);
                if (findUserAfterInsertResult.length === 0) return constant.NO_USER;

                user = findUserAfterInsertResult[0];
            } else {
                user = findUserResult[0];
            }

        } else if (provider === 'apple') {
            /**
             * 애플 로그인/회원가입
             */
            
            const id_token = jwt.decode(authenticationCode) as JwtPayload;

            const email: string = id_token.email;
            const sub: string | undefined = id_token.sub;

            if (!sub || sub === undefined) {
                //id_token의 sub값이 없다면
                return constant.NO_IDENTITY_TOKEN_SUB;
            }


            // 해당 유저가 이미 가입한 유저인지 확인 - sub 사용(유니크한 sub값으로 저장함)
            const findUserQuery = `
                SELECT *
                FROM user
                WHERE provider = ? AND authentication_code = ? AND is_deleted = 0;
            `;
            const findUserResult = await connection.query(findUserQuery, ['apple', sub]);
            user = findUserResult;


            // 회원가입이 필요한 유저인 경우 - db에 유저 정보 insert
            if (findUserResult.length === 0) {
                type = 'signUp';

                const insertUserQuery = `
                    INSERT INTO user (provider, authentication_code, email)
                    VALUE (?, ?, ?);
                `;

                await connection.query(insertUserQuery, [
                    'apple',
                    sub,
                    email
                ]);

                // 유저 insert 결과 조회(재사용)
                const findUserAfterInsertResult = await connection.query(findUserQuery, ['apple', sub]);
                if (findUserAfterInsertResult.length === 0) return constant.NO_USER;

                user = findUserAfterInsertResult[0];
            } else {
                user = findUserResult[0];
            }
        }

        if (typeof user === 'undefined') return constant.NO_USER; 

        // jwt token 발급
        const accessToken = jwtHandler.accessSign(user);
        const refreshToken = jwtHandler.refreshSign(user);


        // 발급된 refresh token db에 update
        const updateTokenQuery = `
            UPDATE user
            SET refresh_token = ?
            WHERE id = ? AND is_deleted = 0;
        `;

        await connection.query(updateTokenQuery, [
            refreshToken,
            user.id,
        ])

        // 새로 발급한 jwt token과 유저 id, 로그인/회원가입 타입 return
        const data: AuthTokenResponseDto = {
            _id: user.id.toString(),
            type: type,
            accessToken,
            refreshToken,
        };

        return data;
    } catch (error) {
        console.log(error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getNewAccessToken = async (userId: number, refreshToken: string): Promise<Number | AuthTokenResponseDto> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        const getRefreshTokenQuery = `
        SELECT *
        FROM user
        WHERE id = ?
            AND is_deleted = 0;
        `;

        const getRefreshTokenResult = await connection.query(getRefreshTokenQuery, [userId]);

        // db에 저장된 refresh token이 리퀘스트의 토큰과 일치하지 않을 때
        if (getRefreshTokenResult[0].refresh_token != refreshToken) return constant.WRONG_TOKEN;

        const user: UserInfoRDB = getRefreshTokenResult[0];

        // 새로운 access token 발급
        const accessToken = jwtHandler.accessSign(user);

        const decoded = jwtHandler.verify(refreshToken);
        const beforeExp = decoded.exp - Date.now() / 1000;

        let newRefreshToken = null;
        let type: string = 'renew access token';
        // 남은 기간이 한달 이하면 새로운 refresh token 발급
        if (beforeExp < 60 * 60 * 24 * 30) {
            newRefreshToken = jwtHandler.refreshSign(user);
            type = 'renew access and refresh token';

            const updateNewTokenQuery = `
            UPDATE user
            SET refresh_token = ?
            WHERE id = ?
                AND is_deleted = 0;
            `;

            await connection.query(updateNewTokenQuery, [newRefreshToken, userId]);
        }

        // 리턴할 refresh token
        const returnRefreshToken: string = newRefreshToken ? newRefreshToken : refreshToken;

        const data: AuthTokenResponseDto = {
            _id: user.id.toString(),
            type,
            accessToken,
            refreshToken: returnRefreshToken
        };

        return data;
    } catch (error) {
        console.log(error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export default {
    login,
    getNewAccessToken,
};
