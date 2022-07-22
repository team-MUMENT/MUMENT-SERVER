import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { UserService } from '../services';
import sendMessage, { SlackMessageFormat } from '../library/slackWebHook';

/**
 *  @ROUTE GET /my/:userId/list?tag1=&tag2=&tag3=
 *  @DESC 보관함에서 나의 뮤멘트 리스트를 조회합니다. 필터링이 필요한 경우 필터링합니다.
 */
const getMyMumentList = async (req: Request, res: Response) => {
    const { tag1, tag2, tag3 } = req.query;
    let tagList = [Number(tag1), Number(tag2), Number(tag3)];
    tagList = tagList.filter(tag => isNaN(tag) === false);

    const { userId } = req.params;

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
 *  @ROUTE GET /like/:userId/list
 *  @DESC 보관함에서 좋아요한 뮤멘트 리스트를 조회합니다. 필터링이 필요한 경우 필터링합니다.
 */
const getLikeMumentList = async (req: Request, res: Response) => {
    const { tag1, tag2, tag3 } = req.query;
    let tagList = [Number(tag1), Number(tag2), Number(tag3)];
    tagList = tagList.filter(tag => isNaN(tag) === false);

    const { userId } = req.params;

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

export default {
    getMyMumentList,
    getLikeMumentList,
};
