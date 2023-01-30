"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const statusCode_1 = __importDefault(require("../modules/statusCode"));
const responseMessage_1 = __importDefault(require("../modules/responseMessage"));
const util_1 = __importDefault(require("../modules/util"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const express_validator_1 = require("express-validator");
const services_1 = require("../services");
const slackWebHook_1 = __importDefault(require("../library/slackWebHook"));
/**
 *  @ROUTE POST /mument/:musicId
 *  @DESC Create Mument 뮤멘트 기록하기
 */
const createMument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const mumentCreateDto = req.body;
    const { musicId } = req.params;
    const userId = req.body.userId;
    try {
        const data = yield services_1.MumentService.createMument(userId, musicId, mumentCreateDto);
        if (!data) {
            return res.status(statusCode_1.default.NOT_FOUND).send(util_1.default.fail(statusCode_1.default.NOT_FOUND, responseMessage_1.default.NOT_FOUND_ID));
        }
        else {
            return res.status(statusCode_1.default.CREATED).send(util_1.default.success(statusCode_1.default.CREATED, responseMessage_1.default.CREATE_MUMENT_SUCCESS, data));
        }
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 *  @ROUTE PUT /mument/:mumentId
 *  @DESC Update Mument 뮤멘트 수정하기
 */
const updateMument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.BAD_REQUEST));
    }
    const { mumentId } = req.params;
    const mumentUpdateDto = req.body;
    try {
        const data = yield services_1.MumentService.updateMument(mumentId, mumentUpdateDto);
        if (data === serviceReturnConstant_1.default.NO_MUMENT) {
            return res.status(statusCode_1.default.NOT_FOUND).send(util_1.default.fail(statusCode_1.default.NOT_FOUND, responseMessage_1.default.NO_MUMENT_ID));
        }
        return res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.UPDATE_MUMENT_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 *  @ROUTE GET /:mumentId
 *  @DESC Get Mument 뮤멘트 상세보기
 */
const getMument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mumentId } = req.params;
    const userId = req.body.userId;
    try {
        const data = yield services_1.MumentService.getMument(mumentId, userId);
        if (!data || data === serviceReturnConstant_1.default.NO_MUMENT) {
            res.status(statusCode_1.default.NOT_FOUND).send(util_1.default.fail(statusCode_1.default.NOT_FOUND, responseMessage_1.default.NOT_FOUND_ID));
        }
        else if (data === serviceReturnConstant_1.default.PRIVATE_MUMENT) {
            res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.NOT_YOUR_MUMENT));
        }
        else {
            res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.READ_MUMENT_SUCEESS, data));
        }
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 *  @ROUTE DELETE /:mumentId
 *  @DESC Delete Mument
 */
const deleteMument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mumentId } = req.params;
    try {
        const data = yield services_1.MumentService.deleteMument(mumentId);
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.DELETE_MUMENT_SUCCESS));
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 *  @ROUTE GET /mument/:musicId/is-first
 *  @DESC 특정 음악에 대해 뮤멘트 기록하기 전 처음/다시 태그 판단
 */
const getIsFirst = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { musicId } = req.params;
    const userId = req.body.userId;
    try {
        const data = yield services_1.MumentService.getIsFirst(userId, musicId);
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.READ_ISFIRST_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE GET /mument/:musicId/:userId/history?default=&limit=&offset=
 * @DESC get mument history
 */
const getMumentHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId: writerId, musicId } = req.params;
    const userId = req.body.userId;
    const { default: orderOption, limit, offset } = req.query;
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.WRONG_PARAMS));
    }
    let orderBy = 'DESC';
    switch (orderOption) {
        case 'Y': {
            orderBy = 'DESC';
            break;
        }
        case 'N': {
            orderBy = 'ASC';
            break;
        }
    }
    ;
    try {
        const data = yield services_1.MumentService.getMumentHistory(userId, musicId, writerId, orderBy, limit, offset);
        if (data === serviceReturnConstant_1.default.NO_MUSIC) {
            // 곡 검색 결과가 없을 경우
            return res.status(statusCode_1.default.NOT_FOUND).send(util_1.default.fail(statusCode_1.default.NOT_FOUND, responseMessage_1.default.NOT_FOUND));
        }
        else if (data === serviceReturnConstant_1.default.BLOCKED_USER) {
            // 차단된 유저는 히스토리 조회 불가
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.BLOCKED_USER));
        }
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.READ_MUMENT_HISTORY_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE POST /mument/:mumentId/like
 * @DESC 좋아요 등록
 */
const createLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mumentId } = req.params;
    const userId = req.body.userId;
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.WRONG_PARAMS));
    }
    try {
        const data = yield services_1.MumentService.createLike(mumentId, userId);
        // 실패했을 때
        switch (data) {
            case serviceReturnConstant_1.default.CREATE_FAIL: {
                // 업데이트가 실패했을 때
                return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.CREATE_LIKE_FAIL));
            }
            case serviceReturnConstant_1.default.NO_MUMENT: {
                // 존재하지 않는 뮤멘트일 때
                return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.NO_MUMENT_ID));
            }
            case serviceReturnConstant_1.default.BLOCKED_USER: {
                // 차단된 유저일 때
                return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.BLOCKED_USER));
            }
        }
        res.status(statusCode_1.default.CREATED).send(util_1.default.success(statusCode_1.default.CREATED, responseMessage_1.default.CREATE_LIKE_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE DELETE /mument/:mumentId/like
 * @DESC 좋아요 취소
 */
const deleteLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mumentId } = req.params;
    const userId = req.body.userId;
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.WRONG_PARAMS));
    }
    try {
        const data = yield services_1.MumentService.deleteLike(mumentId, userId);
        // 실패했을 때
        switch (data) {
            case serviceReturnConstant_1.default.DELETE_FAIL: {
                // 업데이트가 실패했을 때
                res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.DELETE_LIKE_FAIL));
            }
            case serviceReturnConstant_1.default.NO_MUMENT: {
                // 존재하지 않는 뮤멘트일 때
                res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.NO_MUMENT_ID));
            }
        }
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.DELETE_LIKE_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE GET /mument/random
 * @DESC get random tag and tag matched random three muments
 */
const getRandomMument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield services_1.MumentService.getRandomMument();
        if (!data) {
            res.status(statusCode_1.default.NO_CONTENT).send(util_1.default.success(statusCode_1.default.NO_CONTENT, responseMessage_1.default.RANDOM_TAG_FAIL));
        }
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.GET_RANDOM_MUMENT_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE mument/today
 * @DESC get today's mument
 */
const getTodayMument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield services_1.MumentService.getTodayMument();
        // 조회는 성공했으나 결과값이 없을 경우
        if (data === serviceReturnConstant_1.default.NO_HOME_CONTENT) {
            res.status(statusCode_1.default.NO_CONTENT).send(util_1.default.success(statusCode_1.default.NO_CONTENT, responseMessage_1.default.GET_TODAY_MUMENT_SUCCESS));
        }
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.GET_TODAY_MUMENT_SUCCESS, data));
    }
    catch (error) {
        console.log;
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE GET mument/banner
 * @DESC get banner music and tag title list
 */
const getBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield services_1.MumentService.getBanner();
        // 조회는 성공했으나, 결과값이 없는 경우
        if (data === serviceReturnConstant_1.default.NO_HOME_CONTENT) {
            res.status(statusCode_1.default.NO_CONTENT).send(util_1.default.success(statusCode_1.default.NO_CONTENT, responseMessage_1.default.GET_BANNER_SUCCESS));
        }
        else {
            res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.GET_BANNER_SUCCESS, data));
        }
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE GET mument/again
 * @DESC get today's again tagged mument list
 */
const getAgainMument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield services_1.MumentService.getAgainMument();
        if (data === serviceReturnConstant_1.default.NO_HOME_CONTENT) {
            res.status(statusCode_1.default.NO_CONTENT).send(util_1.default.success(statusCode_1.default.NO_CONTENT, responseMessage_1.default.GET_AGAIN_MUMENT_SUCCESS));
        }
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.GET_AGAIN_MUMENT_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE GET /mument/notice/:noticeId
 * @DESC 공지사항 상세보기 조회
 */
const getNoticeDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { noticeId } = req.params;
    try {
        const data = yield services_1.MumentService.getNoticeDetail(noticeId);
        if (data === serviceReturnConstant_1.default.NO_NOTICE) {
            return res.status(statusCode_1.default.NOT_FOUND).send(util_1.default.success(statusCode_1.default.NOT_FOUND, responseMessage_1.default.NOT_FOUND_ID));
        }
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.READ_NOTICE_DETAIL_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE GET /mument/notice/
 * @DESC 공지사항 리스트 조회
 */
const getNoticeList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield services_1.MumentService.getNoticeList();
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.READ_NOTICE_LIST_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE POST /mument/report/:mumentId
 * @DESC 뮤멘트 신고하기
 */
const createReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.BODY_REQUIRED));
    }
    const { mumentId } = req.params;
    const { reportCategory, etcContent } = req.body;
    const userId = req.body.userId;
    try {
        const data = yield services_1.MumentService.createReport(mumentId, reportCategory, etcContent, userId);
        if (data === serviceReturnConstant_1.default.NO_MUMENT) {
            return res.status(statusCode_1.default.NOT_FOUND).send(util_1.default.fail(statusCode_1.default.NOT_FOUND, responseMessage_1.default.NO_MUMENT_ID));
        }
        return res.status(statusCode_1.default.CREATED).send(util_1.default.success(statusCode_1.default.CREATED, responseMessage_1.default.CREATE_REPORT_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE GET /mument/:mumentId/like?limit=&offset=
 * @DESC 해당 뮤멘트에 좋아요를 누른 사용자를 조회
 */
const getLikeUserList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mumentId } = req.params;
    const { limit, offset } = req.query;
    const userId = req.body.userId;
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.BODY_REQUIRED));
    }
    try {
        const data = yield services_1.MumentService.getLikeUserList(mumentId, userId, limit, offset);
        if (data === serviceReturnConstant_1.default.NO_MUMENT) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.NO_MUMENT_ID));
        }
        else if (data === serviceReturnConstant_1.default.NO_RESULT) {
            return res.status(statusCode_1.default.NO_CONTENT).send(util_1.default.success(statusCode_1.default.NO_CONTENT, responseMessage_1.default.READ_LIKE_USER_SUCCESS));
        }
        return res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.READ_LIKE_USER_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = {
            title: 'MUMENT ec2 서버 오류',
            text: '서버 내부 오류입니다',
            fields: [
                {
                    title: 'Error Stack:',
                    value: `\`\`\`${error}\`\`\``,
                },
            ],
        };
        (0, slackWebHook_1.default)(slackMessage);
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
exports.default = {
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
//# sourceMappingURL=MumentController.js.map