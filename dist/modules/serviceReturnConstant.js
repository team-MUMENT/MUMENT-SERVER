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
    // apple
    NO_IDENTITY_TOKEN_SUB: -50,
    APPLE_UNAUTHORIZED: -51,
    APPLE_INTERNAL_SERVER_ERROR: -51,
    // kakao
    NO_AUTHENTICATION_CODE: -60,
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
};
exports.default = constant;
//# sourceMappingURL=serviceReturnConstant.js.map