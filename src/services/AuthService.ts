import { UserResponseDto } from '../interfaces/user/UserResponseDto';
import { UserInfo } from '../interfaces/user/UserInfo';
import User from '../models/User';
import constant from '../modules/serviceReturnConstant';
import dummyData from '../modules/dummyData';

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

export default {
    login,
};
