const axios = require('axios').default;

/**
 * @DESC 클라에게 받은 authentication code로 토큰 발급 받기
 */
const getKakaoToken = async (authenticationCode: string) => {
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
};

const getKakaoProfile = (kakaoAccessToken: string) => {
    return axios({
        method: 'post',
        url: 'https://kapi.kakao.com/v2/user/me',
        headers: {
            'Authorization': 'Bearer ' + kakaoAccessToken,
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    });
};

export default {
    getKakaoToken,
    getKakaoProfile
}