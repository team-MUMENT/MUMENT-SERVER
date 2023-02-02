"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const controllers_1 = require("../controllers");
const auth_1 = __importDefault(require("../middlewares/auth"));
const uploadImage_1 = __importDefault(require("../middlewares/uploadImage"));
const router = (0, express_1.Router)();
// 프로필 설정
router.put('/profile', uploadImage_1.default.single('image'), [
    (0, express_validator_1.body)('profileId').notEmpty().isString(),
], auth_1.default, controllers_1.UserController.putProfile);
// 닉네임 중복 확인
router.get('/profile/check/:profileId', [
    (0, express_validator_1.param)('profileId').isString(),
], auth_1.default, controllers_1.UserController.checkDuplicateName);
// 보관함 나의 뮤멘트 조회
router.get('/my/list', auth_1.default, controllers_1.UserController.getMyMumentList);
// 보관함 좋아요 뮤멘트 조회
router.get('/like/list', auth_1.default, controllers_1.UserController.getLikeMumentList);
// 유저 차단
router.post('/block/:mumentId', auth_1.default, controllers_1.UserController.blockUser);
// 유저 차단 해제
router.delete('/block/:blockedUserId', auth_1.default, controllers_1.UserController.deleteBlockUser);
// 차단 유저 조회
router.get('/block', auth_1.default, controllers_1.UserController.getBlockedUserList);
// 신고 제재 기간인지 조회
router.get('/report/restrict', auth_1.default, controllers_1.UserController.getIsReportRestrictedUser);
// 안읽은 알림 유무 조회
router.get('/news/exist', auth_1.default, controllers_1.UserController.getUnreadNewsisExist);
// 새로운 안읽은 알림 읽음 처리
router.patch('/news/read', auth_1.default, controllers_1.UserController.updateUnreadNews);
// 알림 제거
router.patch('/news/:newsId', auth_1.default, controllers_1.UserController.deleteNews);
// 소식창 리스트 조회
router.get('/news', auth_1.default, controllers_1.UserController.getNewsList);
// 탈퇴 사유 등록
router.post('/leave-category', [
    (0, express_validator_1.body)('leaveCategoryId').toInt().isInt(),
], auth_1.default, controllers_1.UserController.postLeaveCategory);
// 유저 탈퇴
router.delete('/', auth_1.default, controllers_1.UserController.deleteUser);
// 프로필 설정 완료 조회
router.get('/profile/check', auth_1.default, controllers_1.UserController.checkProfileSet);
// 공지사항 등록 - 서버, 기획에서만 사용
router.post('/notice', controllers_1.UserController.postNotice);
// 유저 정보 조회
router.get('/profile', auth_1.default, controllers_1.UserController.getUser);
exports.default = router;
//# sourceMappingURL=UserRouter.js.map