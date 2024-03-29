import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import constant from '../modules/serviceReturnConstant';
import { validationResult } from 'express-validator';
import { AuthService } from '../services';
import slackWebHook, { SlackMessageFormat } from '../library/slackWebHook';
import { AuthTokenResponseDto } from '../interfaces/auth/AuthTokenResponseDto';

/**
 * @ROUTE POST /auth/login
 * @DESC match user profileId and password
 */
const login = async (req: Request, res: Response) => {
    const { provider, authentication_code, fcm_token } = req.body;

    try {
        const data = await AuthService.login(provider, authentication_code, fcm_token);

        switch (data) {
            case constant.NO_AUTHENTICATION_CODE: {
                // 공통 - authentication code가 없는 경우
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_AUTHENTICATION_CODE));
            }
            case constant.INVALID_AUTHENTICATION_CODE: {
                // 공통 - authentication code로 애플 api 요청이 불가한 경우 & 카카오 토큰으로 프로필 조회에 실패한 경우
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
            return res.status(statusCode.CREATED).send(util.success(statusCode.OK, message.SIGNUP_SUCCESS, data));
        } else if ((data as AuthTokenResponseDto).type == 'login') {
            return res.status(statusCode.OK).send(util.success(statusCode.OK, message.LOGIN_SUCCESS, data));
        }
        
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
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
        
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
}

/**
 * @ROUTE Patch /auth/logout
 * @DESC logout
 */
const logout = async (req: Request, res: Response) => {
    const userId = req.body.userId;
    
    try {
        const data = await AuthService.logout(userId);

        if (data === constant.LOGOUT_FAIL) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.LOGOUT_FAIL));
        }
        
        return res.status(statusCode.NO_CONTENT).send();
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE Post /auth/admin/login
 * @DESC 어드민 로그인 - id와 userName, provider만 받아 로그인 진행
 */
const adminLogin = async (req: Request, res: Response) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.BAD_REQUEST));
    }

    const { id, userName, provider } = req.body;
    
    try {
        const data = await AuthService.adminLogin(id, userName, provider);

        if (data === constant.NO_USER) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_USER_ID));
        };

        return res.status(statusCode.OK).send(util.success(statusCode.OK, message.ADMIN_LOGIN_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

export default {
    login,
    getNewAccessToken,
    logout,
    adminLogin,
};
