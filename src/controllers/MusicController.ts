import express, { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { MusicService } from '../services';
import sendMessage, { SlackMessageFormat } from '../library/slackWebHook';
import constant from '../modules/serviceReturnConstant';

/**
 * @ROUTE GET /:musicId/
 * @DESC 곡 상세보기 뷰에서 music 정보와 나의 뮤멘트 정보 가져오기
 */
const getMusicAndMyMument = async (req: Request, res: Response) => {
    const { musicId } = req.params;
    const { userId } = req.body;
    const error = validationResult(req);

    if (!error.isEmpty()) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    try {
        const data = await MusicService.getMusicAndMyMument(musicId, userId);

        if (data === constant.NO_MUSIC) {
            res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_MUSIC_ID));
        } else {
            res.status(statusCode.OK).send(util.success(statusCode.OK, message.FIND_MUSIC_MYMUMENT_SUCCESS, data));
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

        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.SERVICE_UNAVAILABLE, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE /music/:musicId/:userId/order?default=
 * @DESC 곡 상세보기 뷰에서 모든 뮤멘트 조회
 */
const getMumentList = async (req: Request, res: Response) => {
    const { userId, musicId } = req.params;
    const { default: orderOption } = req.query;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    let isLikeOrder: boolean = true;
    switch (orderOption) {
        case 'Y': {
            isLikeOrder = true;
            break;
        }
        case 'N': {
            isLikeOrder = false;
            break;
        }
    }

    try {
        const data = await MusicService.getMumentList(musicId, userId, isLikeOrder);

        // 조회 성공했으나, 결과값 없을 때 204 리턴
        if (!data) {
            res.status(statusCode.NO_CONTENT).send(util.success(statusCode.NO_CONTENT, message.READ_MUSIC_MUMENTLIST_SUCCESS));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_MUSIC_MUMENTLIST_SUCCESS, data));
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
 * @ROUTE GET /search?keyword=
 * @DESC 곡 검색창에서 검색한 음악 리스트 가져오기
 */
const getMusicListBySearch = async (req: Request, res: Response) => {
    const { keyword } = req.query;

    try {
        const data = await MusicService.getMusicListBySearch(keyword as string);

        if (data == constant.APPLE_UNAUTHORIZED) {
            res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, message.APPLE_TOKEN_UNAUTHORIZED));
        }

        if (data == constant.APPLE_INTERNAL_SERVER_ERROR) {
            res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.APPLE_SERVER_INTERNAL_ERROR));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.SEARCH_MUSIC_LIST_SUCCESS, data));
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
    getMusicAndMyMument,
    getMumentList,
    getMusicListBySearch,
};
