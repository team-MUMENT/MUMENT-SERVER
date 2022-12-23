import pools from '../pool';
import { UserInfoRDB } from '../../interfaces/user/UserInfoRDB';


// 카카오 토큰 획득 후 db에 해당 사용자 칼럼 추가
const createKakaoUser = async (authenticationCode: string, email?: string, gender?: string, ageRange?: string) => {
    const query = `
    INSERT INTO user (provider, authentication_code, email, gender, age_range)
    VALUE (kakao, ${authenticationCode},${email}, ${gender}, ${ageRange});
    `;

    await pools.query(query);
};