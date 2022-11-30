import { UserResponseDto } from '../interfaces/user/UserResponseDto';
import { UserInfo } from '../interfaces/user/UserInfo';
import User from '../models/User';
import constant from '../modules/serviceReturnConstant';
import dummyData from '../modules/dummyData';
import { AppleResponseDto } from '../interfaces/auth/AppleResponseDto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import appleSignInLibrary from '../library/appleSignIn';

//방법1
import AppleAuth from 'apple-auth';
const path = require('path');
const appleConfig = require('../config/apple/appleConfig.json');

const login = async (profileId: string, password: string): Promise<UserResponseDto | number> => {
    try {
        /**
         * ✅ 몽고디비 연결 임시 주석처리 + 변수에 임시로 더미 넣어둠
         */
        // // 프로필 아이디로 다큐멘트 조회
        // const user: UserInfo | null = await User.findOne({
        //     profileId: profileId,
        // });

        // // 프로필 아이디가 존재하지 않으면 NO_USER 리턴
        // if (!user) {
        //     return constant.NO_USER;
        // }

        // // 비밀번호 검증
        // const isMatch = !!(password === user.password);

        // // 비밀번호 틀렸을 경우
        // if (!isMatch) {
        //     return constant.WRONG_PASSWORD;
        // }

        // const data: UserResponseDto = {
        //     id: user._id,
        //     profileId: user.profileId,
        //     name: user.name,
        //     image: user.image,
        // };
        const data: UserResponseDto = dummyData.loginDummy;

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const appleSignIn = async (authorization_code: string, identity_token: string): Promise<AppleResponseDto | number> => {
    try {
        /* 방법1 -이거 되면 클라에서 code만 받으면됨*/ 
        const auth = new AppleAuth(appleConfig, path.join(__dirname, `../config/apple/${appleConfig.private_key_path}`), 'text');

        const response = await auth.accessToken(authorization_code);
        const id_token = jwt.decode(response.id_token) as JwtPayload;

        const email: string = id_token.email;

        const sub = id_token?.sub;
        if (!sub) {
            //id_token의 sub값이 null 이라면 400
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
