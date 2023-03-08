import axios from "axios";
import config from "../config";
import constant from "../modules/serviceReturnConstant";
const qs = require('qs');

require('dotenv').config();

const getAppleRefreshToken = async (authorizationCode: string) => {
    const data = {
        'client_id': process.env.APPLE_BUNDLE_ID as string,
        'client_secret': process.env.APPLE_DEVELOPER_TOKEN_NEW as string,
        'code': authorizationCode as string,
        'grant_type': 'authorization_code'
    };

    try {
        const result = await axios.post('https://appleid.apple.com/auth/token', qs.stringify(data)) 
            .then(async function (response: any) {
                if (response.status == 200) {
                    return response.data.refresh_token;
                } else {
                    return null;
                }   
            })
            .catch(async function (error) {
                console.log('애플 토큰 얻기 error', error);
                return null;
            });

        
        return result;
    } catch (error) {
        console.log("애플 리프레시 토큰 axios error", error);
        throw error;
    } 
};


/**
 * 애플 탈퇴 시 연동 해제 - refreshToken 이용
 */
const appleSignRefreshRevoke = async (authorizationCode: string)=> {
    const appleRefreshTokenResult = await getAppleRefreshToken(authorizationCode);
    if (!appleRefreshTokenResult) return constant.GET_APPLE_TOKEN_FAIL;

    const data = {
        'client_id': process.env.APPLE_BUNDLE_ID as string,
        'client_secret': process.env.APPLE_DEVELOPER_TOKEN_NEW as string,
        'token': appleRefreshTokenResult,
        'token_type_hint': 'refresh_token'
    };

    try {
        const resultConstant = await axios.post('https://appleid.apple.com/auth/revoke', qs.stringify(data))
            .then(async function (response: any) {
                if (response.status == 200) {
                    return constant.APPLE_SIGN_REVOKE_SUCCESS;
                } else {
                    return constant.APPLE_SIGN_REVOKE_FAIL;
                }   
            })
            .catch(async function (error) {
                console.log('애플 탈퇴 연동 끊기 axios error', error);
                return constant.APPLE_INTERNAL_SERVER_ERROR;
            });
    
    return resultConstant;

    } catch (error) {
        console.log('애플 탈퇴 연동 끊기 error');
        console.log(error);
        throw error;
    }
};



export default {
    getAppleRefreshToken,
    appleSignRefreshRevoke,
}