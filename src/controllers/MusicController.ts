import express, { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { MusicService } from '../services';
import slackWebHook, { SlackMessageFormat } from '../library/slackWebHook';
import constant from '../modules/serviceReturnConstant';
import { MusicCreateDto } from '../interfaces/music/MusicCreateDto';

/**
 * @ROUTE POST /:musicId/
 * @DESC 곡 상세보기 뷰에서 music 정보와 나의 뮤멘트 정보 가져오기
 */
const getMusicAndMyMument = async (req: Request, res: Response) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.BAD_REQUEST));
    }

    const { musicId } = req.params;
    const userId = req.body.userId;
    const musicCreateDto: MusicCreateDto = req.body;

    try {
        const data = await MusicService.getMusicAndMyMument(musicId, userId, musicCreateDto);

        if (data === constant.NO_MUSIC) {
            return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_MUSIC_ID));
        } else {
            return res.status(statusCode.OK).send(util.success(statusCode.OK, message.FIND_MUSIC_MYMUMENT_SUCCESS, data));
        }
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE /music/:musicId/order?default=&limit=&offset=
 * @DESC 곡 상세보기 뷰에서 모든 뮤멘트 조회
 */
const getMumentList = async (req: Request, res: Response) => {
    const { musicId } = req.params;
    const { userId } = req.body;
    const { default: orderOption} = req.query;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
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

        
        if (!data) {// 조회 성공했으나, 결과값 없을 때 204 리턴
            return res.status(statusCode.NO_CONTENT).send(util.success(statusCode.NO_CONTENT, message.READ_MUSIC_MUMENTLIST_SUCCESS));
        } else if (data === constant.NO_MUSIC) { // 존재하지 않는 음악 아이디일 때 400 리턴
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_MUSIC_ID));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_MUSIC_MUMENTLIST_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
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

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.SEARCH_MUSIC_LIST_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

export default {
    getMusicAndMyMument,
    getMumentList,
    getMusicListBySearch,
};
