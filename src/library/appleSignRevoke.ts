import axios from "axios";
import config from "../config";
import constant from "../modules/serviceReturnConstant";
require('dotenv').config();

/**
 * 애플 탈퇴 시 연동 해제
 */
const appleSignRevoke = async (appleRefreshToken: string): Promise<number> => {

    try {
        await axios.post('https://appleid.apple.com/auth/revoke', {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: {
                'client_id': process.env.APPLE_SERVICE_ID as string,
                'client_secret': config.appleDeveloperToken as string,
                'token': appleRefreshToken,
                'token_type_hint': 'refresh_token'
            }
        })
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
    
    return constant.APPLE_SIGN_REVOKE_SUCCESS;

    } catch (error) {
        console.log('애플 탈퇴 연동 끊기 error');
        console.log(error);
        throw error;
    }
};

export default {
    appleSignRevoke,
}