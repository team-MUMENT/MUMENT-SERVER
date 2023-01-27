import responseMessage from '../modules/responseMessage';
import constant from '../modules/serviceReturnConstant'
import * as admin from 'firebase-admin';
import { Message, MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';

/**
 * 푸시알림 - 공지사항용
 * FCM TOKEN - 여러 개 배열로 받음
 */
const noticePushAlarmHandler = async (pushTitle: string, pushBody: string, fcmTokenList: string[]): Promise<void | number | string[]> => {
    if (fcmTokenList.length === 0) return constant.NOTICE_PUSH_FAIL;

    let message: MulticastMessage = {
        notification: {
            title: pushTitle,
            body: pushBody,
        },
        tokens: fcmTokenList,
        android: {
            priority: 'high',
            notification: {
                sound: 'default',
            },
        },
        apns: {
            payload: {
                aps: {
                    contentAvailable: true,
                    sound: 'default',
                },
            },
        },
    };

    try {
        let pushFailFcmTokenList: string[] = [];

        admin
            .messaging()
            .sendMulticast(message)
            .then(function (res) {
                // 푸시알림 실패한 유저 있을 경우 찾아서 보냄
                if (res.failureCount > 0) {
                    res.responses.forEach((response, idx) => {
                        if (response.success) pushFailFcmTokenList.push(fcmTokenList[idx]) 
                        else return; 
                    })
                }
                
                console.log(responseMessage.PUSH_ALARM_SUCCESS, res, pushFailFcmTokenList);
            })
            .catch(function (err) {
                console.log(responseMessage.PUSH_ALARM_ERROR, err);
                return constant.NOTICE_PUSH_FAIL;
            });
        
        return pushFailFcmTokenList;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * 푸시알림 - 좋아요 알림용
 * FCM TOKEN - 1개 받음
 */
const likePushAlarmHandler = async (pushTitle: string, pushBody: string, fcmToken: string): Promise<void | number | string[]> => {
    if (!fcmToken || fcmToken === undefined) return constant.LIKE_PUSH_FAIL;

    let message: Message = {
        notification: {
            title: pushTitle,
            body: pushBody,
        },
        token: fcmToken,
        android: {
            priority: 'high',
            notification: {
                sound: 'default',
            },
        },
        apns: {
            payload: {
                aps: {
                    contentAvailable: true,
                    sound: 'default',
                },
            },
        },
    };

    try {
        admin
            .messaging()
            .send(message)
            .then(function (res) {        
                console.log(responseMessage.PUSH_ALARM_SUCCESS, res);
            })
            .catch(function (err) {
                console.log(responseMessage.PUSH_ALARM_ERROR, err);
                return constant.LIKE_PUSH_FAIL;
            });
        
        return constant.LIKE_PUSH_SUCCESS;
    } catch (error) {
        console.log(error);
        throw error;
    }
} 



export default {
    noticePushAlarmHandler,
    likePushAlarmHandler,
}