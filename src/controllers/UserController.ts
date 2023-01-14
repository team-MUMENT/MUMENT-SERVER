import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { UserService } from '../services';
import sendMessage, { SlackMessageFormat } from '../library/slackWebHook';
import constant from '../modules/serviceReturnConstant';
import { validationResult } from 'express-validator';

/**
 * @ROUTE POST /profile
 * @DESC 소셜로그인 후 회원가입을 진행합니다.
 */
const putProfile = async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const { profileId } = req.body;
    const image: Express.MulterS3.File = req.file as Express.MulterS3.File;

    const error = validationResult(req);

    if (!error.isEmpty()) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    try {
        let data;

        if (image) {
            const { location } = image;
            data = await UserService.putProfile(userId, profileId, location);
        } else {
            data = await UserService.putProfile(userId, profileId, null);
        }

        if (data === constant.UPDATE_FAIL) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.UPDATE_PROFILE_FAIL));
        } else if (data === constant.NO_USER) {
            return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_USER_ID));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.PROFILE_SET_SUCCESS, data));
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

        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.SERVICE_UNAVAILABLE, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE GET /profile/check/:profileId
 * @DESC 설정하려는 프로필아이디 (이름)이 중복되었는지 확인합니다.
 */
const checkDuplicateName = async (req: Request, res: Response) => {
    const { profileId } = req.params;
    const userId = req.body.userId;
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    try {
        const data = await UserService.checkDuplicateName(profileId);

        if (data) res.status(statusCode.OK).send(util.success(statusCode.OK, message.DUPLICATE_PROFILEID));
        else res.status(statusCode.NO_CONTENT).send(util.success(statusCode.NO_CONTENT, message.AVAILABLE_PROFILEID));
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
 *  @ROUTE GET /my/list?tag1=&tag2=&tag3=
 *  @DESC 보관함에서 나의 뮤멘트 리스트를 조회합니다. 필터링이 필요한 경우 필터링합니다.
 */
const getMyMumentList = async (req: Request, res: Response) => {
    const { tag1, tag2, tag3 } = req.query;
    const userId = req.body.userId;

    let tagList = [Number(tag1), Number(tag2), Number(tag3)];
    tagList = tagList.filter(tag => isNaN(tag) === false);

    try {
        const data = await UserService.getMyMumentList(userId, tagList);

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_MY_MUMENT_LIST_SUCCESS, data));
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
 *  @ROUTE GET /like/list?tag1=&tag2=&tag3=
 *  @DESC 보관함에서 좋아요한 뮤멘트 리스트를 조회합니다. 필터링이 필요한 경우 필터링합니다.
 */
const getLikeMumentList = async (req: Request, res: Response) => {
    const { tag1, tag2, tag3 } = req.query;
    const userId = req.body.userId;

    let tagList = [Number(tag1), Number(tag2), Number(tag3)];
    tagList = tagList.filter(tag => isNaN(tag) === false);

    try {
        const data = await UserService.getLikeMumentList(userId, tagList);

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_LIKE_MUMENT_LIST_SUCCESS, data));
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
 *  @ROUTE POST /block/:mumentId
 *  @DESC 뮤멘트 작성 유저를 차단합니다.
 */
const blockUser = async (req: Request, res: Response) => {
    const { mumentId } = req.params;
    const userId: number = req.body.userId;

    try {
        const data = await UserService.blockUser(userId, mumentId);
        
        if (data === constant.NO_MUMENT) {
            return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_MUMENT_ID));
        } else if (data === constant.ALREADY_BLOCK) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.ALREADY_BLOCK_USER));
        } else if (data === constant.SELF_BLOCK) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.SELF_BLOCK));
        }

        return res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, message.BLOCK_SUCCESS, data));
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
 *  @ROUTE DELETE /block/:blockedUserId
 *  @DESC 차단한 유저를 차단 해제합니다.
 */
const deleteBlockUser = async (req: Request, res: Response) => {
    const { blockedUserId } = req.params;
    const userId: number = req.body.userId;
    
    try {
        const data = await UserService.deleteBlockUser(userId, blockedUserId);

        return res.status(statusCode.NO_CONTENT).send(util.success(statusCode.NO_CONTENT, message.DELETE_BLOCKED_USER_SUCCESS));
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
 *  @ROUTE GET /block
 *  @DESC 차단한 유저 리스트를 조회합니다.
 */
const getBlockedUserList =  async (req: Request, res: Response) => {
    const userId: number = req.body.userId;

    try {
        const data = await UserService.getBlockedUserList(userId);

        return res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_BLOCK_LIST, data));
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
 * @ROUTE POST /leave-category
 * @DESC 탈퇴 사유를 등록합니다.
 */
const postLeaveCategory = async (req: Request, res: Response) => {
    const { leaveCategoryId, reasonEtc } = req.body;
    const userId = req.body.userId;
    
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    try {
        let data;
        
        if (reasonEtc) {
            data = await UserService.postLeaveCategory(userId, leaveCategoryId, reasonEtc);
        } else {
            data = await UserService.postLeaveCategory(userId, leaveCategoryId, null);
        }

        if (data === constant.NO_USER) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_USER_ID));
        } else if (data === constant.CREATE_FAIL) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.CREATE_LEAVE_CATEGORY_FAIL));
        } else {
            return res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, message.CREATE_LEAVE_CATEGORY_SUCESS, data));
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

const deleteUser = async (req: Request, res: Response) => {
    const userId = req.body.userId;

    try {
        const data = await UserService.deleteUser(userId);

        switch (data) {
            case constant.NO_USER:
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_USER_ID));
            case constant.DELETE_FAIL:
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.DELETE_USER_FAIL));
            case constant.DELETE_SUCCESS:
                return res.status(statusCode.OK).send(util.success(statusCode.OK, message.DELETE_USER_SUCCESS));
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

export default {
    getMyMumentList,
    getLikeMumentList,
    blockUser,
    deleteBlockUser,
    getBlockedUserList,
    putProfile,
    checkDuplicateName,
    postLeaveCategory,
    deleteUser,
};
