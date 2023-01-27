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
const jwtHandler_1 = __importDefault(require("../library/jwtHandler"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const slackWebHook_1 = __importDefault(require("../library/slackWebHook"));
/**
 * request-header에서 받은 Bearer 토큰 처리 후 user 전달하는 미들웨어
 */
exports.default = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // request-header에서 Bearer 토큰 받아오기
    const token = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(' ').reverse()[0];
    // 토큰 유무 검증
    if (!token)
        return res.status(statusCode_1.default.UNAUTHORIZED).send(util_1.default.fail(statusCode_1.default.UNAUTHORIZED, responseMessage_1.default.NULL_VALUE_TOKEN));
    try {
        // jwtHandler 토큰 decode 모듈사용
        const decodedToken = jwtHandler_1.default.verify(token);
        if (typeof decodedToken === 'number') {
            // 상수값 대응
            switch (decodedToken) {
                case serviceReturnConstant_1.default.TOKEN_EXPIRED: {
                    return res.status(statusCode_1.default.UNAUTHORIZED).send(util_1.default.fail(statusCode_1.default.UNAUTHORIZED, responseMessage_1.default.TOKEN_EXPIRED));
                }
                case serviceReturnConstant_1.default.TOKEN_INVALID: {
                    return res.status(statusCode_1.default.UNAUTHORIZED).send(util_1.default.fail(statusCode_1.default.UNAUTHORIZED, responseMessage_1.default.TOKEN_INVALID));
                }
                case serviceReturnConstant_1.default.WRONG_TOKEN: {
                    return res.status(statusCode_1.default.UNAUTHORIZED).send(util_1.default.fail(statusCode_1.default.UNAUTHORIZED, responseMessage_1.default.WRONG_TOKEN));
                }
                case serviceReturnConstant_1.default.TOKEN_EXPIRED: {
                    return res.status(statusCode_1.default.UNAUTHORIZED).send(util_1.default.fail(statusCode_1.default.UNAUTHORIZED, responseMessage_1.default.TOKEN_EXPIRED));
                }
                case serviceReturnConstant_1.default.TOKEN_UNKNOWN_ERROR: {
                    return res.status(statusCode_1.default.UNAUTHORIZED).send(util_1.default.fail(statusCode_1.default.UNAUTHORIZED, responseMessage_1.default.TOKEN_UNKNOWN_ERROR));
                }
                case serviceReturnConstant_1.default.NOT_PROFILE_SET_TOKEN: {
                    return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.PROFILE_SET_REQUIRED));
                }
            }
        }
        else {
            // 토큰 유저 정보 확인하기
            const userId = decodedToken.id;
            if (!userId || userId === undefined) {
                return res.status(statusCode_1.default.UNAUTHORIZED).send(util_1.default.fail(statusCode_1.default.UNAUTHORIZED, responseMessage_1.default.TOKEN_INVALID));
            }
            req.body.userId = userId;
            next();
        }
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
//# sourceMappingURL=auth.js.map