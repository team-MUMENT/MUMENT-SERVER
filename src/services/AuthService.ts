import pools from '../modules/pool';
import poolPromise from '../loaders/db'

import { AuthTokenResponseDto } from '../interfaces/auth/AuthTokenResponseDto';
import constant from '../modules/serviceReturnConstant';
import { UserInfoRDB } from '../interfaces/user/UserInfoRDB';

import kakaoAuth from '../library/kakaoAuth';
import AppleAuth from 'apple-auth';
import { AppleResponseDto } from '../interfaces/auth/AppleResponseDto';
import appleSignInLibrary from '../library/appleSignIn';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwtHandler from '../library/jwtHandler';

const path = require('path');
const appleConfig = require('../config/apple/appleConfig.json');

/**
* 로그인/회원가입
*/
const login = async (provider: string, authenticationCode: string): Promise<AuthTokenResponseDto | number> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();
    
    // authentication code가 없는 경우
    if (!authenticationCode) return constant.NO_AUTHENTICATION_CODE;

    try {
        let user: UserInfoRDB;
            
        if (provider === 'kakao') {
            // authentication code로 카카오 토큰 발급 받아오기
            const kakaoToken: Promise<string> = kakaoAuth.getKakaoToken(authenticationCode);
            
            // 카카오 토큰으로 프로필 조회
            const kakaoProfile = kakaoAuth.getKakaoProfile(await kakaoToken);

            // 해당 유저가 이미 가입한 유저인지 확인
            const findUserQuery = `
                SELECT *
                FROM user
                WHERE authentication_code = ? AND is_deleted = 0;
            `;
            const findUserResult = await connection.query(findUserQuery, [authenticationCode]);
            user = findUserResult;

            // 회원가입이 필요한 유저인 경우
            if (findUserResult.length === 0) {
                // db에 유저 정보 insert
                const insertUserQuery = `
                    INSERT INTO user (provider, authentication_code, email, gender, age_range)
                    VALUE (kakao, ?, ?, ?, ?);
                `;

                await connection.query(insertUserQuery, [
                    authenticationCode, 
                    kakaoProfile.account_email,
                    kakaoProfile.gender,
                    kakaoProfile.age_range,
                ]);

                // 유저 insert 결과 조회
                const findUserAfterInsertResult = await connection.query(findUserQuery, [authenticationCode]);
                if (findUserAfterInsertResult.length === 0) return constant.NO_USER;

                user = findUserAfterInsertResult;
            }
        } else if (provider === 'apple') {

        }

        // jwt token 발급
        const accessToken = jwtHandler.accessSign(user);
        const refreshToken = jwtHandler.refreshSign(user);

        // refresh token db에 update
        const updateTokenQuery = `
        UPDATE user
        SET refresh_token = ?
        WHERE id = ?
            AND is_deleted = 0;
        `;

        await connection.query(updateTokenQuery, [
            refreshToken,
            user.id,
        ])

        // 새로 발급한 jwt token 리턴
        const data: AuthTokenResponseDto = {
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

const appleSignIn = async (authorization_code: string): Promise<AppleResponseDto | number> => {
    try {
        /* 방법1 -이거 되면 클라에서 code만 받으면됨*/ 
        const auth = new AppleAuth(appleConfig, path.join(__dirname, `../config/apple/${appleConfig.private_key_path}`), 'text');

        const response = await auth.accessToken(authorization_code);
        const id_token = jwt.decode(response.id_token) as JwtPayload;

        const email: string = id_token.email;

        const sub = id_token?.sub;
        if (!sub) {
            //id_token의 sub값이 null 이라면 400
            return constant.NO_IDENTITY_TOKEN_SUB; // to-do : 컨트롤러에 상수 추가
        }

        /*방법2 */
        // // authorization code로 apple server에서 token 받기 - access, refresh token 포함
        // const { AppleTokenData }: any = await appleSignInLibrary.getAppleToken(authorization_code);
        // // to-do : apple server에서 200일경우, 400일 경우 나눠서 작성해야함
        // console.log(AppleTokenData);
        

        // // identity token을 통해 sub, email 등의 정보 가져올 수 있음
        // // identity token을 decode해서 id값은 sub에, email은 email에 넣기
        // const { sub: id, email} = (jwt.decode(identity_token) ?? {}) as {  // decode한 값이 null일땐 빈 {} 전달
        //     sub: string; // 사용자를 식별할 수 있는 id 값
        //     email: string;
        // };

        // // 사용자 식별 id가 존재하면
        // if (id) {
        //     const data: AppleResponseDto = {
        //         accessToken: 'access',
        //         refreshToken: 'refresh',
        //         id,
        //         email
        //     };
            
        //     return data; 
        // }
        
        // id가 존재하지 않으면
        return constant.NO_IDENTITY_TOKEN_SUB;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export default {
    login,
    appleSignIn
};
