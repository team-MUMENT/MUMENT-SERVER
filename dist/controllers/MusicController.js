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
const express_validator_1 = require("express-validator");
const services_1 = require("../services");
const slackWebHook_1 = __importDefault(require("../library/slackWebHook"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
/**
 * @ROUTE GET /:musicId/
 * @DESC 곡 상세보기 뷰에서 music 정보와 나의 뮤멘트 정보 가져오기
 */
const getMusicAndMyMument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { musicId } = req.params;
    const { userId } = req.body;
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.WRONG_PARAMS));
    }
    try {
        const data = yield services_1.MusicService.getMusicAndMyMument(musicId, userId);
        if (data === serviceReturnConstant_1.default.NO_MUSIC) {
            return res.status(statusCode_1.default.NOT_FOUND).send(util_1.default.fail(statusCode_1.default.NOT_FOUND, responseMessage_1.default.NO_MUSIC_ID));
        }
        else {
            return res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.FIND_MUSIC_MYMUMENT_SUCCESS, data));
        }
    }
    catch (error) {
        console.log(error);
        const slackMessage = slackWebHook_1.default.slackErrorMessage(error.stack);
        slackWebHook_1.default.sendMessage(slackMessage);
        return res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE /music/:musicId/order?default=&limit=&offset=
 * @DESC 곡 상세보기 뷰에서 모든 뮤멘트 조회
 */
const getMumentList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { musicId } = req.params;
    const { userId } = req.body;
    const { default: orderOption, limit, offset } = req.query;
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.WRONG_PARAMS));
    }
    let isLikeOrder = true;
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
        const data = yield services_1.MusicService.getMumentList(musicId, userId, isLikeOrder, limit, offset);
        if (!data) { // 조회 성공했으나, 결과값 없을 때 204 리턴
            return res.status(statusCode_1.default.NO_CONTENT).send(util_1.default.success(statusCode_1.default.NO_CONTENT, responseMessage_1.default.READ_MUSIC_MUMENTLIST_SUCCESS));
        }
        else if (data === serviceReturnConstant_1.default.NO_MUSIC) { // 존재하지 않는 음악 아이디일 때 400 리턴
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.NO_MUSIC_ID));
        }
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.READ_MUSIC_MUMENTLIST_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = slackWebHook_1.default.slackErrorMessage(error.stack);
        slackWebHook_1.default.sendMessage(slackMessage);
        return res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE GET /search?keyword=
 * @DESC 곡 검색창에서 검색한 음악 리스트 가져오기
 */
const getMusicListBySearch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword } = req.query;
    try {
        const data = yield services_1.MusicService.getMusicListBySearch(keyword);
        if (data == serviceReturnConstant_1.default.APPLE_UNAUTHORIZED) {
            return res.status(statusCode_1.default.UNAUTHORIZED).send(util_1.default.fail(statusCode_1.default.UNAUTHORIZED, responseMessage_1.default.APPLE_TOKEN_UNAUTHORIZED));
        }
        if (data == serviceReturnConstant_1.default.APPLE_INTERNAL_SERVER_ERROR) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.APPLE_SERVER_INTERNAL_ERROR));
        }
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.SEARCH_MUSIC_LIST_SUCCESS, data));
    }
    catch (error) {
        console.log(error);
        const slackMessage = slackWebHook_1.default.slackErrorMessage(error.stack);
        slackWebHook_1.default.sendMessage(slackMessage);
        return res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.INTERNAL_SERVER_ERROR, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
exports.default = {
    getMusicAndMyMument,
    getMumentList,
    getMusicListBySearch,
};
//# sourceMappingURL=MusicController.js.map