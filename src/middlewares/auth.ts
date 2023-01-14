import express, { Request, Response, NextFunction } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import jwtHandler from '../library/jwtHandler';
import constant from '../modules/serviceReturnConstant';
import userDB from '../modules/db/User';
import sendMessage, { SlackMessageFormat } from '../library/slackWebHook';

/**
 * request-header에서 받은 Bearer 토큰 처리 후 user 전달하는 미들웨어
 */
export default async (req: Request, res: Response, next: NextFunction) => {
    // request-header에서 Bearer 토큰 받아오기
    const token = req.headers["authorization"]?.split(' ').reverse()[0];

    // 토큰 유무 검증
    if (!token) return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, message.NULL_VALUE_TOKEN));


    try {
        // jwtHandler 토큰 decode 모듈사용
        const decodedToken = jwtHandler.verify(token);

        if (typeof decodedToken === 'number') {
            // 상수값 대응
            switch (decodedToken) {
                case constant.TOKEN_EXPIRED: {
                    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, message.TOKEN_EXPIRED));
                }
                case constant.TOKEN_INVALID: {
                    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, message.TOKEN_INVALID));
                }
                case constant.WRONG_TOKEN: {
                    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, message.WRONG_TOKEN));
                }
                case constant.TOKEN_EXPIRED: {
                    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, message.TOKEN_EXPIRED));
                }
                case constant.TOKEN_UNKNOWN_ERROR: {
                    return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, message.TOKEN_UNKNOWN_ERROR));
                }
                case constant.NOT_PROFILE_SET_TOKEN: {
                    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.UNAUTHORIZED, message.PROFILE_SET_REQUIRED));
                }
            }

        } else {
             // 토큰 유저 정보 확인하기
            const userId = decodedToken.id;

            if (!userId || userId === undefined) {
                 return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, message.TOKEN_INVALID));
            }

            req.body.userId  = userId;
            next();
        } 

    } catch (error) {
        console.log(error);

        const slackMessage: SlackMessageFormat = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        sendMessage(slackMessage);

        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};