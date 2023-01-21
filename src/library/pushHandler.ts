import responseMessage from '../modules/responseMessage';
import constant from '../modules/serviceReturnConstant'
import sendMessage, { SlackMessageFormat } from '../library/slackWebHook';
import config from '../config';
import * as admin from 'firebase-admin';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { response } from 'express';

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

export default {
    noticePushAlarmHandler,
}