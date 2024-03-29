"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant = {
    NO_RESULT: 0,
    CREATE_SUCCESS: 1,
    UPDATE_SUCCESS: 2,
    DELETE_SUCCESS: 3,
    CREATE_FAIL: -1,
    UPDATE_FAIL: -2,
    DELETE_FAIL: -3,
    NO_USER: -11,
    NO_MUSIC: -12,
    NO_MUMENT: -13,
    WRONG_PASSWORD: -14,
    NO_HOME_CONTENT: -15,
    PRIVATE_MUMENT: -16,
    NO_NOTICE: -17,
    CREATE_NOTICE_FAIL: -18,
    WRONG_QUERYSTRING: -19,
    FAIL_SOCIAL_AUTH: -20,
    // apple
    NO_IDENTITY_TOKEN_SUB: -50,
    APPLE_UNAUTHORIZED: -51,
    APPLE_INTERNAL_SERVER_ERROR: -51,
    APPLE_SIGN_REVOKE_SUCCESS: -52,
    APPLE_SIGN_REVOKE_FAIL: -53,
    GET_APPLE_TOKEN_SUCCESS: -54,
    GET_APPLE_TOKEN_FAIL: -55,
    // kakao
    NO_AUTHENTICATION_CODE: -60,
    INVALID_AUTHENTICATION_CODE: -61,
    NO_KAKAO_REFRESH_TOKEN: -62,
    LOGOUT_FAIL: -63,
    KAKAO_UNLINK_SUCCESS: -64,
    KAKAO_UNLINK_FAIL: -65,
    // jwt token
    TOKEN_EXPIRED: -100,
    TOKEN_INVALID: -101,
    WRONG_TOKEN: -102,
    TOKEN_NOT_BEFORE: -103,
    NOT_PROFILE_SET_TOKEN: -110,
    TOKEN_UNKNOWN_ERROR: -199,
    // 유저 차단
    ALREADY_BLOCK: -200,
    SELF_BLOCK: -201,
    BLOCKED_USER: -202,
    // push alarm
    NOTICE_PUSH_FAIL: -300,
    NOTICE_PUSH_SUCCESS: -301,
    LIKE_PUSH_FAIL: -302,
    LIKE_PUSH_SUCCESS: -303, // 좋아요 푸시 알림 성공
};
exports.default = constant;
//# sourceMappingURL=serviceReturnConstant.js.map