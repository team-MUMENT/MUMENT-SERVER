import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import constant from '../modules/serviceReturnConstant';
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

        if (!data) {
            res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND_ID));
        } else {
            res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, message.CREATE_MUMENT_SUCCESS, data));
        }
    } catch (error) {
        console.log(error);

        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 *  @ROUTE PUT /mument/:mumentId
 *  @DESC Update Mument
 */
const updateMument = async (req: Request, res: Response) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.BAD_REQUEST));
    }

    const { mumentId } = req.params;
    const mumentUpdateDto: MumentCreateDto = req.body;

    try {
        const data = await MumentService.updateMument(mumentId, mumentUpdateDto);

        if (!data) {
            res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_MUMENT_ID));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.UPDATE_MUMENT_SUCCESS, data));
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
 *  @ROUTE DELETE /:mumentId
 *  @DESC Delete Mument
 */
const deleteMument = async (req: Request, res: Response) => {
    const { mumentId } = req.params;

    try {
        const data = await MumentService.deleteMument(mumentId);

        res.status(statusCode.NO_CONTENT).send(util.success(statusCode.NO_CONTENT, message.DELETE_MUMENT_SUCCESS));
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
 * @ROUTE GET /mument/:userId/:musicId/history?default=
 * @DESC get mument history
 */
const getMumentHistory = async (req: Request, res: Response) => {
    const { musicId, userId } = req.params;
    const { default: orderOption } = req.query;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    let isLatestOrder: boolean = true;
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

/**
 * @ROUTE POST /mument/:mumentId/:userId/like
 * @DESC 좋아요 등록
 */
const createLike = async (req: Request, res: Response) => {
    const { mumentId, userId } = req.params;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    try {
        const data = await MumentService.createLike(mumentId, userId);

        // 실패했을 때
        switch (data) {
            case null: {
                // 업데이트가 실패했을 때
                res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.CREATE_LIKE_FAIL));
            }
            case constant.NO_MUSIC: {
                // 음악 data가 없을 때
                res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_MUSIC_ID));
            }
        }

        res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, message.CREATE_LIKE_SUCCESS, data));
    } catch (error) {
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE DELETE /mument/:mumentId/:userId/like
 * @DESC 좋아요 취소
 */
const deleteLike = async (req: Request, res: Response) => {
    const { mumentId, userId } = req.params;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    try {
        const data = await MumentService.deleteLike(mumentId, userId);

        if (!data) {
            res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.DELETE_LIKE_FAIL));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.DELETE_LIKE_SUCCESS, data));
    } catch (error) {
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE GET /mument/random
 * @DESC get random tag and tag matched random three muments
 */
const getRandomMument = async (req: Request, res: Response) => {
    try {
        const data = await MumentService.getRandomMument();

        if (!data) {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.BAD_REQUEST, message.RANDOM_TAG_FAIL));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.GET_RANDOM_MUMENT_SUCCESS, data));
    } catch (error) {
        console.log(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE mument/today
 * @DESC get today's mument
 */
const getTodayMument = async (req: Request, res: Response) => {
    try {
        const data = await MumentService.getTodayMument();

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.GET_TODAY_MUMENT_SUCCESS, data));
    } catch (error) {
        console.log;
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

export default {
    createMument,
    updateMument,
    getMument,
    deleteMument,
    getIsFirst,
    getMumentHistory,
    createLike,
    deleteLike,
    getRandomMument,
    getTodayMument,
};
