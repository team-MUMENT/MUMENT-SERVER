import responseMessage from '../modules/responseMessage';
import constant from '../modules/serviceReturnConstant'
import * as admin from 'firebase-admin';
import { Message, MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';
import slackWebHook, { SlackMessageFormat } from '../library/slackWebHook';

/**
 * 푸시알림 - 공지사항용
 * FCM TOKEN - 여러 개 배열로 받음
 */
const noticePushAlarmHandler = async (pushTitle: string, pushBody: string, fcmTokenList: string[]): Promise<void | number> => {
    if (fcmTokenList.length === 0) return constant.NOTICE_PUSH_FAIL;

    let message: MulticastMessage = {
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
        let pushFailFcmTokenList: string[] = [];

        await admin
            .messaging()
            .sendMulticast(message)
            .then(function (res) {
                // 푸시알림 실패한 유저 있을 경우 찾아서 보냄
                if (res.failureCount > 0) {
                    res.responses.forEach((response, idx) => {
                        if (!response.success) pushFailFcmTokenList.push(fcmTokenList[idx]) 
                        else return; 
                    })
                }
                console.log('공지 푸시 실패유저 토큰: ', pushFailFcmTokenList);
<<<<<<< HEAD
                const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(`공지 푸시알림 실패 유저의 fcm token입니다 : ${pushFailFcmTokenList}`);
=======
                const slackMessage: SlackMessageFormat = slackWebHook.slackPushFailMessage(`공지 푸시알림 실패 유저의 fcm token입니다 : ${pushFailFcmTokenList}`);
>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557
                slackWebHook.sendMessage(slackMessage);
                
            })
            .catch(function (err) {
                console.log(responseMessage.PUSH_ALARM_ERROR, err);
                return constant.NOTICE_PUSH_FAIL;
            });
        
        return constant.NOTICE_PUSH_SUCCESS;
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
        await admin
            .messaging()
            .send(message)
<<<<<<< HEAD
            .then(function (res) {      
            })
            .catch(function (err) {
                console.log(responseMessage.PUSH_ALARM_ERROR, err);
                const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(`좋아요 푸시 실패 유저의 fcm token입니다 : ${fcmToken}`);
=======
            .then(function (res) {   
            })
            .catch(function (err) {
                console.log(responseMessage.PUSH_ALARM_ERROR, err);
                const slackMessage: SlackMessageFormat = slackWebHook.slackPushFailMessage(`좋아요 푸시 실패 유저의 fcm token입니다 : ${fcmToken}`);
>>>>>>> 6f65d3d7d8e4a839810a0352a17b768d376a3557
                slackWebHook.sendMessage(slackMessage);  
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