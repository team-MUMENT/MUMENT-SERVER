import responseMessage from '../modules/responseMessage';
import constant from '../modules/serviceReturnConstant'
import sendMessage, { SlackMessageFormat } from '../library/slackWebHook';
import config from '../config';
import * as admin from 'firebase-admin';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';

/**
 * 푸시알림 - 공지사항용
 * FCM TOKEN - 여러 개 배열로 받음
 */
const noticePushAlarmHandler = async (pushTitle: string, pushBody: string, fcmTokenList: string[]): Promise<void | number> => {
    if (fcmTokenList.length === 0) return constant.NOTICE_PUSH_FAIL;

    let message: MulticastMessage = {
        notification: {
            title: pushTitle,
            body: pushBody,
            imageUrl: config.noticePushAlarmImage, //일단 따라함 안되면 지우기- 이미지
        },
        tokens: fcmTokenList,
        android: {
            priority: 'high',
            notification: { //일단 따라함 안되면 지우기- 이미지
                imageUrl: config.noticePushAlarmImage,
            },
        },
        apns: {
            payload: {
                aps: {
                    contentAvailable: true,
                },
                fcm_options: { //일단 따라함 안되면 지우기 - 이미지
                    imageUrl: config.noticePushAlarmImage,
                },
            },
        },
    };

    try {
        admin
            .messaging()
            .sendMulticast(message)
            .then(function (res) {
                console.log(responseMessage.PUSH_ALARM_SUCCESS, res);
            })
            .catch(function (err) {
                console.log(responseMessage.PUSH_ALARM_ERROR, err);
            });
        return constant.NOTICE_PUSH_SUCCESS;
    } catch (error) {
        console.log(error);
        throw error;
    }

    
}

export default {
    noticePushAlarmHandler,
}