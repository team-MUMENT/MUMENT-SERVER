import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import constant from '../modules/serviceReturnConstant';
import { validationResult } from 'express-validator';
import { AuthService } from '../services';
import sendMessage, { SlackMessageFormat } from '../library/slackWebHook';

/**
 * @ROUTE POST /auth/login
 * @DESC match user profileId and password
 */
const login = async (req: Request, res: Response) => {
    // **리팩토링 전 코드**
    // const { profileId, password } = req.body;
    const { provider, authentication_code } = req.body;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_BODY));
    }

    try {
        // **리팩토링 전 코드**
        //const data = await AuthService.login(profileId, password);
        // // 실패했을 때
        // switch (data) {
        //     case constant.NO_USER: {
        //         res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_USER_PROFILEID));
        //     }
        //     case constant.WRONG_PASSWORD: {
        //         res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.LOGIN_FAIL));
        //     }
        // }

        const data = await AuthService.login(provider, authentication_code);

        switch (data) {
            case constant.NO_AUTHENTICATION_CODE: {
                // 공통 - authentication code가 없는 경우
                res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.no));
            }
            case constant.NO_IDENTITY_TOKEN_SUB: {
                // 애플 - authorization code에 sub값이 없을 때
                res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_IDENTITY_TOKEN_SUB));
            }
            case constant.NO_USER: {
                // 카카오 - 회원가입 진행 중 유저가 생성되지 않았을 때
                res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_USER_PROFILEID));
            }
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.LOGIN_SUCCESS, data));
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

/**
 * @ROUTE POST /auth/apple
 * @DESC apple signin
 */
const appleSignIn = async (req: Request, res: Response) => {
    const { authorization_code } = req.body;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        // request body에 code or identity token을 보내지 않을 경우 400
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.BODY_REQUIRED));
    }

    try {
        const data = await AuthService.appleSignIn(authorization_code);

        if (data===constant.NO_IDENTITY_TOKEN_SUB) {
            // Identity token에 sub(id)값이 없을 경우 400
            res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_IDENTITY_TOKEN_SUB));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.LOGIN_SUCCESS, data));

    } catch (error) {
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }


};

export default {
    login,
    appleSignIn
};
