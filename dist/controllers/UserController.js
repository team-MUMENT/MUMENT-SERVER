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
const services_1 = require("../services");
const slackWebHook_1 = __importDefault(require("../library/slackWebHook"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const express_validator_1 = require("express-validator");
/**
 * @ROUTE POST /profile
 * @DESC 소셜로그인 후 회원가입을 진행합니다.
 */
const putProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    const { profileId } = req.body;
    const image = req.file;
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.WRONG_PARAMS));
    }
    try {
        let data;
        if (image) {
            const { location } = image;
            data = yield services_1.UserService.putProfile(userId, profileId, location);
        }
        else {
            data = yield services_1.UserService.putProfile(userId, profileId, null);
        }
        if (data === serviceReturnConstant_1.default.UPDATE_FAIL) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.UPDATE_PROFILE_FAIL));
        }
        else if (data === serviceReturnConstant_1.default.NO_USER) {
            return res.status(statusCode_1.default.NOT_FOUND).send(util_1.default.fail(statusCode_1.default.NOT_FOUND, responseMessage_1.default.NO_USER_ID));
        }
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.PROFILE_SET_SUCCESS, data));
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
        res.status(statusCode_1.default.INTERNAL_SERVER_ERROR).send(util_1.default.fail(statusCode_1.default.SERVICE_UNAVAILABLE, responseMessage_1.default.INTERNAL_SERVER_ERROR));
    }
});
/**
 * @ROUTE GET /profile/check/:profileId
 * @DESC 설정하려는 프로필아이디 (이름)이 중복되었는지 확인합니다.
 */
const checkDuplicateName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profileId } = req.params;
    const userId = req.body.userId;
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.WRONG_PARAMS));
    }
    try {
        const data = yield services_1.UserService.checkDuplicateName(profileId);
        if (data)
            res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.DUPLICATE_PROFILEID));
        else
            res.status(statusCode_1.default.NO_CONTENT).send(util_1.default.success(statusCode_1.default.NO_CONTENT, responseMessage_1.default.AVAILABLE_PROFILEID));
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
 *  @ROUTE GET /my/list?tag1=&tag2=&tag3=
 *  @DESC 보관함에서 나의 뮤멘트 리스트를 조회합니다. 필터링이 필요한 경우 필터링합니다.
 */
const getMyMumentList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tag1, tag2, tag3 } = req.query;
    const userId = req.body.userId;
    let tagList = [Number(tag1), Number(tag2), Number(tag3)];
    tagList = tagList.filter(tag => isNaN(tag) === false);
    try {
        const data = yield services_1.UserService.getMyMumentList(userId, tagList);
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.READ_MY_MUMENT_LIST_SUCCESS, data));
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
 *  @ROUTE GET /like/list?tag1=&tag2=&tag3=
 *  @DESC 보관함에서 좋아요한 뮤멘트 리스트를 조회합니다. 필터링이 필요한 경우 필터링합니다.
 */
const getLikeMumentList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tag1, tag2, tag3 } = req.query;
    const userId = req.body.userId;
    let tagList = [Number(tag1), Number(tag2), Number(tag3)];
    tagList = tagList.filter(tag => isNaN(tag) === false);
    try {
        const data = yield services_1.UserService.getLikeMumentList(userId, tagList);
        res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.READ_LIKE_MUMENT_LIST_SUCCESS, data));
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
 *  @ROUTE POST /block/:mumentId
 *  @DESC 뮤멘트 작성 유저를 차단합니다.
 */
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mumentId } = req.params;
    const userId = req.body.userId;
    try {
        const data = yield services_1.UserService.blockUser(userId, mumentId);
        if (data === serviceReturnConstant_1.default.NO_MUMENT) {
            return res.status(statusCode_1.default.NOT_FOUND).send(util_1.default.fail(statusCode_1.default.NOT_FOUND, responseMessage_1.default.NO_MUMENT_ID));
        }
        else if (data === serviceReturnConstant_1.default.ALREADY_BLOCK) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.ALREADY_BLOCK_USER));
        }
        else if (data === serviceReturnConstant_1.default.SELF_BLOCK) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.SELF_BLOCK));
        }
        return res.status(statusCode_1.default.CREATED).send(util_1.default.success(statusCode_1.default.CREATED, responseMessage_1.default.BLOCK_SUCCESS, data));
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
 *  @ROUTE DELETE /block/:blockedUserId
 *  @DESC 차단한 유저를 차단 해제합니다.
 */
const deleteBlockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { blockedUserId } = req.params;
    const userId = req.body.userId;
    try {
        const data = yield services_1.UserService.deleteBlockUser(userId, blockedUserId);
        return res.status(statusCode_1.default.NO_CONTENT).send(util_1.default.success(statusCode_1.default.NO_CONTENT, responseMessage_1.default.DELETE_BLOCKED_USER_SUCCESS));
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
 *  @ROUTE GET /block
 *  @DESC 차단한 유저 리스트를 조회합니다.
 */
const getBlockedUserList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    try {
        const data = yield services_1.UserService.getBlockedUserList(userId);
        return res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.READ_BLOCK_LIST, data));
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
 * @ROUTE POST /leave-category
 * @DESC 탈퇴 사유를 등록합니다.
 */
const postLeaveCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { leaveCategoryId, reasonEtc } = req.body;
    const userId = req.body.userId;
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.WRONG_PARAMS));
    }
    try {
        let data;
        if (reasonEtc) {
            data = yield services_1.UserService.postLeaveCategory(userId, leaveCategoryId, reasonEtc);
        }
        else {
            data = yield services_1.UserService.postLeaveCategory(userId, leaveCategoryId, null);
        }
        if (data === serviceReturnConstant_1.default.NO_USER) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.NO_USER_ID));
        }
        else if (data === serviceReturnConstant_1.default.CREATE_FAIL) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.CREATE_LEAVE_CATEGORY_FAIL));
        }
        else {
            return res.status(statusCode_1.default.CREATED).send(util_1.default.success(statusCode_1.default.CREATED, responseMessage_1.default.CREATE_LEAVE_CATEGORY_SUCESS, data));
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
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    try {
        const data = yield services_1.UserService.deleteUser(userId);
        switch (data) {
            case serviceReturnConstant_1.default.NO_USER:
                return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.NO_USER_ID));
            case serviceReturnConstant_1.default.DELETE_FAIL:
                return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.DELETE_USER_FAIL));
        }
        return res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.DELETE_USER_SUCCESS, data));
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
 *  @ROUTE GET /news
 *  @DESC 신고 제재 기간인 유저인지 확인
 */
const getIsReportRestrictedUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    try {
        const data = yield services_1.UserService.getIsReportRestrictedUser(Number(userId));
        return res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.REPORT_RESTRICTION_USER_SUCCESS, data));
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
 *  @ROUTE GET /news/exist
 *  @DESC 소식창에 안읽은 알림이 있는지 조회합니다.
 */
const getUnreadNewsisExist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    try {
        const data = yield services_1.UserService.getUnreadNewsisExist(Number(userId));
        return res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.READ_UNREAD_NEWS_IS_EXIST_SUCCESS, data));
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
 *  @ROUTE PATCH /news/read
 *  @DESC 안읽은 새로운 알림들을 읽음 처리합니다.
 */
const updateUnreadNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    const { unreadNews } = req.body;
    try {
        const data = yield services_1.UserService.updateUnreadNews(Number(userId), unreadNews);
        if (data === serviceReturnConstant_1.default.UPDATE_FAIL) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.BAD_REQUEST));
        }
        return res.status(statusCode_1.default.NO_CONTENT).send(util_1.default.success(statusCode_1.default.NO_CONTENT, responseMessage_1.default.READ_UNREAD_NEWS_SUCCESS));
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
 *  @ROUTE PATCH /news/:newsId
 *  @DESC 소식창 알림을 제거합니다.
 */
const deleteNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    const { newsId } = req.params;
    try {
        const data = yield services_1.UserService.deleteNews(Number(userId), Number(newsId));
        if (data === serviceReturnConstant_1.default.UPDATE_FAIL) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.fail(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.BAD_REQUEST));
        }
        return res.status(statusCode_1.default.NO_CONTENT).send(util_1.default.success(statusCode_1.default.NO_CONTENT, responseMessage_1.default.DELETE_NEWS_SUCCESS));
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
 *  @ROUTE GET /news
 *  @DESC 소식창 리스트를 조회합니다.
 */
const getNewsList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    try {
        const data = yield services_1.UserService.getNewsList(userId);
        return res.status(statusCode_1.default.OK).send(util_1.default.success(statusCode_1.default.OK, responseMessage_1.default.READ_NEWS_LIST_SUCCESS, data));
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
 * @ROUTE GET profile/check
 * @DESC 프로필 설정이 완료되었는지 확인하는 API입니다.
 */
const checkProfileSet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // auth에서 401이 리턴되지 않았다면 204 리턴
        res.status(statusCode_1.default.NO_CONTENT).send(util_1.default.success(statusCode_1.default.NO_CONTENT, responseMessage_1.default.COMPLETE_PROFILE_SET));
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
 *  @ROUTE POST /notice
 *  @DESC 공지사항을 등록 후 푸시알림을 날립니다 - 서버, 기획에서만 사용
 */
const postNotice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content } = req.body;
    try {
        const data = yield services_1.UserService.postNotice(title, content);
        if (typeof data === "number" && data === serviceReturnConstant_1.default.CREATE_NOTICE_FAIL) {
            return res.status(statusCode_1.default.BAD_REQUEST).send(util_1.default.success(statusCode_1.default.BAD_REQUEST, responseMessage_1.default.CREATE_NOTICE_FAIL));
        }
        else if (!data.pushSuccess) {
            return res.status(statusCode_1.default.CREATED).send(util_1.default.success(statusCode_1.default.CREATED, responseMessage_1.default.PUSH_ALARM_ERROR, data));
        }
        else if (data.pushSuccess) {
            return res.status(statusCode_1.default.CREATED).send(util_1.default.success(statusCode_1.default.CREATED, responseMessage_1.default.PUSH_ALARM_SUCCESS, data));
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
exports.default = {
    getMyMumentList,
    getLikeMumentList,
    blockUser,
    deleteBlockUser,
    getIsReportRestrictedUser,
    getBlockedUserList,
    putProfile,
    checkDuplicateName,
    postLeaveCategory,
    deleteUser,
    getUnreadNewsisExist,
    updateUnreadNews,
    deleteNews,
    getNewsList,
    checkProfileSet,
    postNotice,
};
//# sourceMappingURL=UserController.js.map