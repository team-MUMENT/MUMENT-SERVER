const jwt = require('jsonwebtoken');
import { NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { JwtPayloadInfo } from '../interfaces/auth/JwtPayload';
import { UserInfoRDB } from '../interfaces/user/UserInfoRDB';
import constant from '../modules/serviceReturnConstant';
import config from '../config';

const accessOption = {
    expiresIn: '30d',
    issuer: 'Mument',
};
const refreshOption = {
    expiresIn: '60d',
    issuer: 'Mument',
};

// accessToken 발급 함수
const accessSign = (user: UserInfoRDB) => {
    const payload: JwtPayloadInfo = {
        id: user.id,
        profileId: user.profile_id,
        image: user.image 
    };

    const accessToken: string = jwt.sign(payload, config.jwtSecret, accessOption);

    return accessToken;
}

// refreshToken 발급 함수
const refreshSign = (user: UserInfoRDB) => {
    const payload: JwtPayloadInfo = {
        id: user.id,
        profileId: user.profile_id,
        image: user.image 
    };

    const refreshToken: string = jwt.sign(payload, config.jwtSecret, refreshOption);

    return refreshToken;
}

// 토큰 decode 함수
const verify = (token: string) => {
    try {
        const decoded = jwt.verify(token, config.jwtSecret);

        return decoded;
    } catch (err: any) {
        if (err.name == 'TokenExpiredError') {
            // 토큰 만료
            console.log(err.message);
            return constant.TOKEN_EXPIRED;
        } else if (err.message == 'invalid token') {
            // 유효하지 않은 토큰일 때
            console.log(err.message);
            return constant.TOKEN_INVALID;
        } else if (err.message == 'jwt malformed' || 'jwt signature is required' || 'invalid signature') {
            console.log(err.message);
            return constant.WRONG_TOKEN;
        } else if (err.name == NotBeforeError) {
            // 리프레쉬 토큰 갱신 기간 전일 때
            console.log(err.message);
            return constant.TOKEN_NOT_BEFORE;
        } else {
            // 그 외 토큰 에러
            console.log(err.message);
            return constant.TOKEN_UNKNOWN_ERROR;
        }
    }
}

export default {
    accessSign,
    refreshSign,
    verify
}