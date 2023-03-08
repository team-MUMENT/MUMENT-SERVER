"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const statusCode_1 = __importDefault(require("../modules/statusCode"));
const responseMessage_1 = __importDefault(require("../modules/responseMessage"));
const util_1 = __importDefault(require("../modules/util"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const express_validator_1 = require("express-validator");
const services_1 = require("../services");
const slackWebHook_1 = __importDefault(require("../library/slackWebHook"));
/**
 * @ROUTE POST /auth/login
 * @DESC match user profileId and password
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { provider, authentication_code, fcm_token } = req.body;
    try {
        const data = yield services_1.AuthService.login(provider, authentication_code, fcm_token);
        switch (data) {
            case serviceReturnConstant_1.default.NO_AUTHENTICATION_CODE: {
                // 공통 - authentication code가 없는 경우
                return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.NO_AUTHENTICATION_CODE));
            }
            case serviceReturnConstant_1.default.INVALID_AUTHENTICATION_CODE: {
                // 공통 - authentication code로 애플 api 요청이 불가한 경우 & 카카오 토큰으로 프로필 조회에 실패한 경우
                return res.status(statusCode_1.default.UNAUTHORIZED).send(util_1.default.fail(statusCode_1.default.UNAUTHORIZED, responseMessage_1.default.INVALID_AUTHENTICATION_CODE));
            }
            case serviceReturnConstant_1.default.NO_IDENTITY_TOKEN_SUB: {
                // 애플 - authorization code에 sub값이 없을 때
                return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.NO_IDENTITY_TOKEN_SUB));
            }
            case serviceReturnConstant_1.default.NO_USER: {
                // 카카오 - 회원가입 진행 중 유저가 생성되지 않았을 때
                return res.status(statusCode_1.default.NOT_FOUND).send(util_1.default.fail(statusCode_1.default.NOT_FOUND, responseMessage_1.default.NO_USER_PROFILEID));
            }
        }
        if (data.type == 'signUp') {
            return res.status(statusCode_1.default.CREATED).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.SIGNUP_SUCCESS, data));
        }
        else if (data.type == 'login') {
            return res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.LOGIN_SUCCESS, data));
        }
    }
    catch (error) {
        console.log(error);
        const slackMessage = slackWebHook_1.default.slackErrorMessage(error.stack);
        slackWebHook_1.default.sendMessage(slackMessage);
        return res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE GET /auth/token
 * @DESC 액세스 토큰이 만료되었을 때, 리프래쉬 토큰을 조회하여 새 액세스 토큰을 발급
 */
const getNewAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.body.userId;
    const refreshToken = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(' ').reverse()[0];
    if (typeof refreshToken != 'string')
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.WRONG_PARAMS));
    try {
        const data = yield services_1.AuthService.getNewAccessToken(userId, refreshToken);
        if (data === serviceReturnConstant_1.default.WRONG_TOKEN) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.NOT_CORRECT_TOKEN));
        }
        else if (data.type === 'renew access and refresh token') {
            return res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.RENEW_ACCESS_REFRESH_TOKEN, data));
        }
        else {
            return res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.RENEW_ACCESS_TOKEN, data));
        }
    }
    catch (error) {
        console.log(error);
        const slackMessage = slackWebHook_1.default.slackErrorMessage(error.stack);
        slackWebHook_1.default.sendMessage(slackMessage);
        return res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE Patch /auth/logout
 * @DESC logout
 */
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    try {
        const data = yield services_1.AuthService.logout(userId);
        if (data === serviceReturnConstant_1.default.LOGOUT_FAIL) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.LOGOUT_FAIL));
        }
        return res.status(statusCode_1.default.NO_CONTENT).send();
    }
    catch (error) {
        console.log(error);
        const slackMessage = slackWebHook_1.default.slackErrorMessage(error.stack);
        slackWebHook_1.default.sendMessage(slackMessage);
        return res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE Post /auth/admin/login
 * @DESC 어드민 로그인 - id와 userName, provider만 받아 로그인 진행
 */
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.BAD_REQUEST));
    }
    const { id, userName, provider } = req.body;
    try {
        const data = yield services_1.AuthService.adminLogin(id, userName, provider);
        if (data === serviceReturnConstant_1.default.NO_USER) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.NO_USER_ID));
        }
        ;
        return res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.ADMIN_LOGIN_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = slackWebHook_1.default.slackErrorMessage(error.stack);
        slackWebHook_1.default.sendMessage(slackMessage);
        return res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
exports.default = {
    login,
    getNewAccessToken,
    logout,
    adminLogin,
};
//# sourceMappingURL=AuthController.js.map