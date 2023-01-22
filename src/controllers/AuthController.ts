import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import constant from '../modules/serviceReturnConstant';
import { validationResult } from 'express-validator';
import { AuthService } from '../services';
import sendMessage, { SlackMessageFormat } from '../library/slackWebHook';
import { AuthTokenResponseDto } from '../interfaces/auth/AuthTokenResponseDto';

/**
 * @ROUTE POST /auth/login
 * @DESC match user profileId and password
 */
const login = async (req: Request, res: Response) => {
    const { provider, authentication_code } = req.body;

    try {
        const data = await AuthService.login(provider, authentication_code);

        switch (data) {
            case constant.NO_AUTHENTICATION_CODE: {
                // 공통 - authentication code가 없는 경우
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_AUTHENTICATION_CODE));
            }
            case constant.INVALID_AUTHENTICATION_CODE: {
                // 공통 - authentication code로 카카오/애플 api 요청이 불가한 경우
                return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, message.INVALID_AUTHENTICATION_CODE));
            }
            case constant.NO_IDENTITY_TOKEN_SUB: {
                // 애플 - authorization code에 sub값이 없을 때
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_IDENTITY_TOKEN_SUB));
            }
            case constant.NO_USER: {
                // 카카오 - 회원가입 진행 중 유저가 생성되지 않았을 때
                return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_USER_PROFILEID));
            }
        }

        if ((data as AuthTokenResponseDto).type == 'signUp') {
            res.status(statusCode.CREATED).send(util.success(statusCode.OK, message.SIGNUP_SUCCESS, data));
        } else if ((data as AuthTokenResponseDto).type == 'login') {
            res.status(statusCode.OK).send(util.success(statusCode.OK, message.LOGIN_SUCCESS, data));
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
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE GET /auth/token
 * @DESC 액세스 토큰이 만료되었을 때, 리프래쉬 토큰을 조회하여 새 액세스 토큰을 발급
 */
const getNewAccessToken = async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const refreshToken = req.headers["authorization"]?.split(' ').reverse()[0];

    if (typeof refreshToken != 'string') return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    try {
        const data = await AuthService.getNewAccessToken(userId, refreshToken);

        if (data === constant.WRONG_TOKEN) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NOT_CORRECT_TOKEN));
        } else if ((data as AuthTokenResponseDto).type === 'renew access and refresh token'){
            return res.status(statusCode.OK).send(util.success(statusCode.OK, message.RENEW_ACCESS_REFRESH_TOKEN, data));
        } else {
            return res.status(statusCode.OK).send(util.success(statusCode.OK, message.RENEW_ACCESS_TOKEN, data));
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
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
}

export default {
    login,
    getNewAccessToken,
};
