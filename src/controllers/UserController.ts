import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import constant from '../modules/serviceReturnConstant';
import { validationResult } from 'express-validator';
import { UserService } from '../services';

/**
 *  @ROUTE GET /my/:userId/list
 *  @DESC Get My Mument List
 */
const getMyMumentList = async (req: Request, res: Response) => {
    //const { tag1, tag2, tag3 } = req.query;

    const { userId } = req.params;

    try {
        const data = await UserService.getMyMumentList(userId);

        if (!data) res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND_ID));
        res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_MY_MUMENT_LIST_SUCCESS, data));
    } catch (error) {
        console.log(error);

        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 *  @ROUTE GET /like/:userId/list
 *  @DESC Get My Mument List
 */
const getLikeMumentList = async (req: Request, res: Response) => {
    //const { tag1, tag2, tag3 } = req.query;

    const { userId } = req.params;

    try {
        const data = await UserService.getLikeMumentList(userId);

        if (!data) res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND_ID));
        res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_LIKE_MUMENT_LIST_SUCCESS, data));
    } catch (error) {
        console.log(error);

        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE POST /user/auth/login
 * @DESC match user profileId and password
 */
const login = async (req: Request, res: Response) => {
    const { profileId, password } = req.body;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_BODY));
    }

    try {
        const data = await UserService.login(profileId, password);

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
    getMyMumentList,
    getLikeMumentList,
    login,
};
