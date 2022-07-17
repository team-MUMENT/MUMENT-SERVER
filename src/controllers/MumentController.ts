import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import { validationResult } from 'express-validator';
import { MumentService } from '../services';
import { MumentCreateDto } from '../interfaces/mument/MumentCreateDto';
import { PostBaseResponseDto } from '../interfaces/common/PostBaseResponseDto';

/**
 *  @ROUTE POST /mument/:userId/:musicId
 *  @DESC Create Mument
 */
const createMument = async (req: Request, res: Response) => {
    const mumentCreateDto: MumentCreateDto = req.body;
    const { userId, musicId } = req.params;

    try {
        const data: PostBaseResponseDto | null = await MumentService.createMument(userId, musicId, mumentCreateDto);

        if (!data) res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND_ID));

        res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, message.CREATE_MUMENT_SUCCESS, data));
    } catch (error) {
        console.log(error);

        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 *  @ROUTE GET /:mumentId/:userId
 *  @DESC Get Mument
 */
const getMument = async (req: Request, res: Response) => {
    const { mumentId, userId } = req.params;

    try {
        const data = await MumentService.getMument(mumentId, userId);

        if (!data) {
            res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND_ID));
        } else if (data === true) {
            res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NOT_YOUR_MUMENT));
        } else {
            res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_MUMENT_SUCEESS, data));
        }
    } catch (error) {
        console.log(error);

        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 *  @ROUTE GET /mument/:userId/:musicId/is-first
 *  @DESC 특정 음악에 대해 뮤멘트 기록하기 전 처음/다시 태그 판단
 */
const getIsFirst = async (req: Request, res: Response) => {
    const { userId, musicId } = req.params;

    try {
        const data = await MumentService.getIsFirst(userId, musicId);

        // 존재하지않는 musicId를 보낼 경우
        if (!data) res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND_ID));

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_ISFIRST_SUCCESS, data));
    } catch (error) {
        console.log(error);

        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE /mument/:userId/:musicId/history?default=
 * @DESC get mument history
 */
const getMumentHistory = async (req: Request, res: Response) => {
    const { musicId, userId } = req.params;
    const { default: orderOption } = req.query;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    let isLatestOrder: boolean;
    switch (orderOption) {
        case 'Y': {
            isLatestOrder = true;
            break;
        }
        case 'N': {
            isLatestOrder = false;
            break;
        }
    }

    try {
        const data = await MumentService.getMumentHistory(userId, musicId, isLatestOrder);

        // 곡 검색 결과가 없을 경우
        if (!data) {
            res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_MUMENT_HISTORY_SUCCESS, data));
    } catch (error) {
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

export default {
    createMument,
    getMument,
    getIsFirst,
    getMumentHistory,
};
