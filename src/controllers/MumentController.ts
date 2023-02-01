import { Request, Response } from 'express';
import statusCode from '../modules/statusCode';
import message from '../modules/responseMessage';
import util from '../modules/util';
import constant from '../modules/serviceReturnConstant';
import { validationResult } from 'express-validator';
import { MumentService } from '../services';
import { MumentCreateDto } from '../interfaces/mument/MumentCreateDto';
import { PostBaseResponseDto } from '../interfaces/common/PostBaseResponseDto';
import slackWebHook, { SlackMessageFormat } from '../library/slackWebHook';

/**
 *  @ROUTE POST /mument/:musicId
 *  @DESC Create Mument 뮤멘트 기록하기
 */
const createMument = async (req: Request, res: Response) => {
    const mumentCreateDto: MumentCreateDto = req.body;
    const { musicId } = req.params;
    const userId = req.body.userId;

    try {
        const data: PostBaseResponseDto | null = await MumentService.createMument(userId, musicId, mumentCreateDto);

        if (!data) {
            return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND_ID));
        } else {
            return res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, message.CREATE_MUMENT_SUCCESS, data));
        }
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);

        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 *  @ROUTE PUT /mument/:mumentId
 *  @DESC Update Mument 뮤멘트 수정하기
 */
const updateMument = async (req: Request, res: Response) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.BAD_REQUEST));
    }

    const { mumentId } = req.params;
    const mumentUpdateDto: MumentCreateDto = req.body;

    try {
        const data = await MumentService.updateMument(mumentId, mumentUpdateDto);

        if (data === constant.NO_MUMENT) {
            return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_MUMENT_ID));
        } 
        
        return res.status(statusCode.OK).send(util.success(statusCode.OK, message.UPDATE_MUMENT_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 *  @ROUTE GET /:mumentId
 *  @DESC Get Mument 뮤멘트 상세보기
 */
const getMument = async (req: Request, res: Response) => {
    const { mumentId} = req.params;
    const userId = req.body.userId;

    try {
        const data = await MumentService.getMument(mumentId, userId);

        if (!data || data === constant.NO_MUMENT) {
            return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NOT_FOUND_ID));
        } else if (data === constant.PRIVATE_MUMENT) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NOT_YOUR_MUMENT));
        } else {
            return res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_MUMENT_SUCEESS, data));
        }
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
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

        return res.status(statusCode.OK).send(util.success(statusCode.OK, message.DELETE_MUMENT_SUCCESS));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 *  @ROUTE GET /mument/:musicId/is-first
 *  @DESC 특정 음악에 대해 뮤멘트 기록하기 전 처음/다시 태그 판단
 */
const getIsFirst = async (req: Request, res: Response) => {
    const { musicId } = req.params;    
    const userId = req.body.userId;

    try {
        const data = await MumentService.getIsFirst(userId, musicId);

        return res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_ISFIRST_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE GET /mument/:musicId/:userId/history?default=&limit=&offset=
 * @DESC get mument history
 */
const getMumentHistory = async (req: Request, res: Response) => {
    const { musicId, userId: writerId } = req.params;
    const userId = req.body.userId;
    const { default: orderOption, limit, offset } = req.query;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    let orderBy: string = 'DESC';
    switch (orderOption) {
        case 'Y': {
            orderBy = 'DESC';
            break;
        }
        case 'N': {
            orderBy = 'ASC';
            break;
        }
    };


    try {
        const data = await MumentService.getMumentHistory(userId, musicId, writerId, orderBy, limit, offset);

        return res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_MUMENT_HISTORY_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE POST /mument/:mumentId/like
 * @DESC 좋아요 등록
 */
const createLike = async (req: Request, res: Response) => {
    const { mumentId } = req.params;
    const userId = req.body.userId;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    try {
        const data = await MumentService.createLike(mumentId, userId);

        // 실패했을 때
        switch (data) {
            case constant.CREATE_FAIL: {
                // 업데이트가 실패했을 때
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.CREATE_LIKE_FAIL));
            }
            case constant.NO_MUMENT: {
                // 존재하지 않는 뮤멘트일 때
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_MUMENT_ID));
            }
            case constant.BLOCKED_USER: {
                // 차단된 유저일 때
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.BLOCKED_USER));
            }
        }

        return res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, message.CREATE_LIKE_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE DELETE /mument/:mumentId/like
 * @DESC 좋아요 취소
 */
const deleteLike = async (req: Request, res: Response) => {
    const { mumentId } = req.params;
    const userId = req.body.userId;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.WRONG_PARAMS));
    }

    try {
        const data = await MumentService.deleteLike(mumentId, userId);

        // 실패했을 때
        switch (data) {
            case constant.DELETE_FAIL: {
                // 업데이트가 실패했을 때
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.DELETE_LIKE_FAIL));
            }
            case constant.NO_MUMENT: {
                // 존재하지 않는 뮤멘트일 때
                return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_MUMENT_ID));
            }
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.DELETE_LIKE_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
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
            return res.status(statusCode.NO_CONTENT).send(util.success(statusCode.NO_CONTENT, message.RANDOM_TAG_FAIL));
        }

        return res.status(statusCode.OK).send(util.success(statusCode.OK, message.GET_RANDOM_MUMENT_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE mument/today
 * @DESC get today's mument
 */
const getTodayMument = async (req: Request, res: Response) => {
    try {
        const data = await MumentService.getTodayMument();

        // 조회는 성공했으나 결과값이 없을 경우
        if (data === constant.NO_HOME_CONTENT) {
            return res.status(statusCode.NO_CONTENT).send(util.success(statusCode.NO_CONTENT, message.GET_TODAY_MUMENT_SUCCESS));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.GET_TODAY_MUMENT_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE GET mument/banner
 * @DESC get banner music and tag title list
 */
const getBanner = async (req: Request, res: Response) => {
    try {
        const data = await MumentService.getBanner();

        // 조회는 성공했으나, 결과값이 없는 경우
        if (data === constant.NO_HOME_CONTENT) {
            return res.status(statusCode.NO_CONTENT).send(util.success(statusCode.NO_CONTENT, message.GET_BANNER_SUCCESS));
        } else {
            return res.status(statusCode.OK).send(util.success(statusCode.OK, message.GET_BANNER_SUCCESS, data));
        }
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE GET mument/again
 * @DESC get today's again tagged mument list
 */
const getAgainMument = async (req: Request, res: Response) => {
    try {
        const data = await MumentService.getAgainMument();

        if (data === constant.NO_HOME_CONTENT) {
            return res.status(statusCode.NO_CONTENT).send(util.success(statusCode.NO_CONTENT, message.GET_AGAIN_MUMENT_SUCCESS));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.GET_AGAIN_MUMENT_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE GET /mument/notice/:noticeId
 * @DESC 공지사항 상세보기 조회
 */
const getNoticeDetail = async (req: Request, res: Response) => {
    const { noticeId } = req.params;

    try {
        const data = await MumentService.getNoticeDetail(noticeId);

        if (data === constant.NO_NOTICE) {
            return res.status(statusCode.NOT_FOUND).send(util.success(statusCode.NOT_FOUND, message.NOT_FOUND_ID));
        } 

        res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_NOTICE_DETAIL_SUCCESS, data));

    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE GET /mument/notice/
 * @DESC 공지사항 리스트 조회
 */
const getNoticeList = async (req: Request, res: Response) => {
    try {
        const data = await MumentService.getNoticeList();

        return res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_NOTICE_LIST_SUCCESS, data));

    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE POST /mument/report/:mumentId
 * @DESC 뮤멘트 신고하기
 */
const createReport = async (req: Request, res: Response) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.BODY_REQUIRED));
    }

    const { mumentId } = req.params;
    const { reportCategory, etcContent } = req.body;
    const userId = req.body.userId

    try {
        const data = await MumentService.createReport(mumentId, reportCategory, etcContent, userId);

        if (data === constant.NO_MUMENT) {
            return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, message.NO_MUMENT_ID));
        } 
        
        return res.status(statusCode.CREATED).send(util.success(statusCode.CREATED, message.CREATE_REPORT_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
};

/**
 * @ROUTE GET /mument/:mumentId/like?limit=&offset=
 * @DESC 해당 뮤멘트에 좋아요를 누른 사용자를 조회
 */
const getLikeUserList = async (req: Request, res: Response) => {
    const { mumentId } = req.params;
    const { limit, offset } = req.query;
    const userId = req.body.userId;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.BODY_REQUIRED));
    }

    try {
        const data = await MumentService.getLikeUserList(mumentId, userId, limit, offset);

        if (data === constant.NO_MUMENT) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, message.NO_MUMENT_ID));
        } else if (data === constant.NO_RESULT) {
            return res.status(statusCode.NO_CONTENT).send(util.success(statusCode.NO_CONTENT, message.READ_LIKE_USER_SUCCESS));
        }

        return res.status(statusCode.OK).send(util.success(statusCode.OK, message.READ_LIKE_USER_SUCCESS, data));
    } catch (error: any) {
        console.log(error);

        const slackMessage: SlackMessageFormat = slackWebHook.slackErrorMessage(error.stack);
        slackWebHook.sendMessage(slackMessage);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
    }
}

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
    getBanner,
    getAgainMument,
    getNoticeDetail,
    getNoticeList,
    createReport,
    getLikeUserList,
};
