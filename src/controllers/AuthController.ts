import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import constant from '../modules/serviceReturnConstant';
import { validationResult } from 'express-validator';
import { AuthService } from '../services';

/**
 * @ROUTE POST /auth/login
 * @DESC match user profileId and password
 */
const login = async (req: Request, res: Response) => {
    const { profileId, password } = req.body;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_BODY));
    }

    try {
        const data = await AuthService.login(profileId, password);

        // 실패했을 때
        switch (data) {
            case constant.NO_USER: {
                res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_USER_PROFILEID));
            };
            case constant.WRONG_PASSWORD: {
                res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.LOGIN_FAIL));
            };
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.LOGIN_SUCCESS, data));
    } catch (error) {
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

export default {
    login,
};
