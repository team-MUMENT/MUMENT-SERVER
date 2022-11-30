import { UserInfoRDB } from '../../interfaces/user/UserInfoRDB';
import pools from '../pool';

/**
 * user 관련 재사용 쿼리 - 트랜잭션 쓸 때 사용가능
 */



/**
 * user 관련 재사용 쿼리 - 트랜잭션 없이 사용가능
 */

// userId로 유저 레코드 가져오기
const userInfo = async (userId: string) => {
    const query = 'SELECT * FROM user WHERE id=? AND NOT is_deleted=1'; //탈퇴하지 않은 유저
    
    const user: UserInfoRDB[] = await pools.queryValue(query, [userId]);

    return user[0];
}

export default {
    userInfo,
}

