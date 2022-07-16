import express, { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { MusicService } from '../services';

/**
 * @ROUTE GET /:musicId/:userId
 * @DESC 곡 상세보기 뷰에서 music 정보와 나의 뮤멘트 정보 가져오기
 */
const getMusicAndMyMument = async (req: Request, res: Response) => {
    const { musicId, userId } = req.params;
    const error = validationResult(req);

    if (!error.isEmpty()) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    try {
        const data = await MusicService.getMusicAndMyMument(musicId, userId);

        if (!data) {
            res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.FIND_MUSIC_MYMUMENT_SUCCESS, data));
    } catch (error) {
        console.log(error);
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

    let isLikeOrder: boolean;
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
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

export default {
    getMusicAndMyMument,
    getMumentList,
};
