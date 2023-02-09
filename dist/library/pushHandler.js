"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const responseMessage_1 = __importDefault(require("../modules/responseMessage"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const admin = __importStar(require("firebase-admin"));
const slackWebHook_1 = __importDefault(require("../library/slackWebHook"));
/**
 * 푸시알림 - 공지사항용
 * FCM TOKEN - 여러 개 배열로 받음
 */
const noticePushAlarmHandler = (pushTitle, pushBody, fcmTokenList) => __awaiter(void 0, void 0, void 0, function* () {
    if (fcmTokenList.length === 0)
        return serviceReturnConstant_1.default.NOTICE_PUSH_FAIL;
    let message = {
        data: {
            type: 'notice',
            title: pushTitle,
            body: pushBody
        },
        tokens: fcmTokenList,
        android: {
            priority: 'high',
        },
        apns: {
            payload: {
                aps: {
                    contentAvailable: true,
                    sound: 'default',
                    alert: {
                        title: pushTitle,
                        body: pushBody,
                    }
                },
            },
        },
    };
    try {
        let pushFailFcmTokenList = [];
        yield admin
            .messaging()
            .sendMulticast(message)
            .then(function (res) {
            // 푸시알림 실패한 유저 있을 경우 찾아서 보냄
            if (res.failureCount > 0) {
                res.responses.forEach((response, idx) => {
                    if (!response.success)
                        pushFailFcmTokenList.push(fcmTokenList[idx]);
                    else
                        return;
                });
            }
            console.log('공지 푸시 실패유저 토큰: ', pushFailFcmTokenList);
            const slackMessage = slackWebHook_1.default.slackErrorMessage(`공지 푸시알림 실패 유저의 fcm token입니다 : ${pushFailFcmTokenList}`);
            slackWebHook_1.default.sendMessage(slackMessage);
        })
            .catch(function (err) {
            console.log(responseMessage_1.default.PUSH_ALARM_ERROR, err);
            return serviceReturnConstant_1.default.NOTICE_PUSH_FAIL;
        });
        return serviceReturnConstant_1.default.NOTICE_PUSH_SUCCESS;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
/**
 * 푸시알림 - 좋아요 알림용
 * FCM TOKEN - 1개 받음
 */
const likePushAlarmHandler = (pushTitle, pushBody, fcmToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fcmToken || fcmToken === undefined)
        return serviceReturnConstant_1.default.LIKE_PUSH_FAIL;
    let message = {
        data: {
            type: 'like',
            title: pushTitle,
            body: pushBody,
        },
        token: fcmToken,
        android: {
            priority: 'high',
        },
        apns: {
            payload: {
                aps: {
                    contentAvailable: true,
                    sound: 'default',
                    alert: {
                        title: pushTitle,
                        body: pushBody,
                    }
                },
            },
        },
    };
    try {
        yield admin
            .messaging()
            .send(message)
            .then(function (res) {
        })
            .catch(function (err) {
            console.log(responseMessage_1.default.PUSH_ALARM_ERROR, err);
            const slackMessage = slackWebHook_1.default.slackErrorMessage(`좋아요 푸시 실패 유저의 fcm token입니다 : ${fcmToken}`);
            slackWebHook_1.default.sendMessage(slackMessage);
            return serviceReturnConstant_1.default.LIKE_PUSH_FAIL;
        });
        return serviceReturnConstant_1.default.LIKE_PUSH_SUCCESS;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
exports.default = {
    noticePushAlarmHandler,
    likePushAlarmHandler,
};
//# sourceMappingURL=pushHandler.js.map