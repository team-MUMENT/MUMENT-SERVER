const axios = require('axios').default;

//const request = require('https');
const kakaoRequestUrl = 'kapi.kakao.com/v2/user/me?secure_resource=true';

/**
 * @DESC 클라에게 받은 액세스 토큰으로 사용자 정보 가져오기
 * @ERR
 * 1. 액세스 토큰으로 요청한 사용자 정보가 없을 때
 */
const getKakaoProfile = async (kakaoAccesstoken: string) => {
    return axios.post('kapi.kakao.com'
    );
}