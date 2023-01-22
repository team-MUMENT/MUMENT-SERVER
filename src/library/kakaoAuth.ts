import constant from "../modules/serviceReturnConstant";

const axios = require('axios').default;

/**
 * @DESC 클라에게 받은 authentication code로 토큰 발급 받기
 */
const getKakaoToken = async (authenticationCode: string): Promise<string | number> => {
    let kakaoToken: string | number = constant.INVALID_AUTHENTICATION_CODE;

    try {
        await axios({
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
        }).then((response: string) => {
            kakaoToken = response;

        }).catch((error: Error)=> {
            console.log('카카오 토큰 발급 실패');
            console.log(error);
            return constant.INVALID_AUTHENTICATION_CODE;
        });

        return kakaoToken;
    } catch (error) {
        console.log('카카오 토큰 발급 에러');
        console.log(error);
        throw error;
    }
};

const getKakaoProfile = async (kakaoAccessToken: string) => {
    let kakaoProfile: any = constant.INVALID_AUTHENTICATION_CODE;

    try {
        await axios({
            method: 'post',
            url: 'https://kapi.kakao.com/v2/user/me',
            headers: {
                'Authorization': 'Bearer ' + kakaoAccessToken,
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }).then((response: string) => {
            kakaoProfile = response;

        }).catch((error: Error)=> {
            console.log('카카오 프로필 조회 실패');
            console.log(error);
            return constant.INVALID_AUTHENTICATION_CODE;
        });

        return kakaoProfile;
    } catch (error) {
        console.log('카카오 프로필 조회 에러');
        console.log(error);
        throw error;
    }
};

export default {
    getKakaoToken,
    getKakaoProfile
}