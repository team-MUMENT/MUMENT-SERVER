"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const express_validator_1 = require("express-validator");
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = (0, express_1.Router)();
// 뮤멘트 기록하기
router.post('/:musicId', auth_1.default, controllers_1.MumentController.createMument);
// 처음/다시 조회
router.get('/:musicId/is-first', auth_1.default, controllers_1.MumentController.getIsFirst);
// 뮤멘트 수정하기
router.put('/:mumentId', [
    (0, express_validator_1.body)('isFirst').notEmpty(),
], auth_1.default, controllers_1.MumentController.updateMument);
// 히스토리 조회
router.get('/:musicId/:userId/history', [
    (0, express_validator_1.param)('musicId').toInt().isInt(),
    (0, express_validator_1.param)('userId').toInt().isInt(),
    (0, express_validator_1.query)('default').isString().isIn(['Y', 'N']),
], auth_1.default, controllers_1.MumentController.getMumentHistory);
// 좋아요 등록
router.post('/:mumentId/like', [
    (0, express_validator_1.param)('mumentId').toInt().isInt(),
], auth_1.default, controllers_1.MumentController.createLike);
// 좋아요 삭제
router.delete('/:mumentId/like', [
    (0, express_validator_1.param)('mumentId').toInt().isInt()
], auth_1.default, controllers_1.MumentController.deleteLike);
// 랜덤 뮤멘트
router.get('/random', auth_1.default, controllers_1.MumentController.getRandomMument);
// 오늘의 뮤멘트
router.get('/today', auth_1.default, controllers_1.MumentController.getTodayMument);
// 배너
router.get('/banner', auth_1.default, controllers_1.MumentController.getBanner);
// 다시 들은 뮤멘트
router.get('/again', auth_1.default, controllers_1.MumentController.getAgainMument);
// 공시자항 리스트
router.get('/notice', controllers_1.MumentController.getNoticeList);
// 공시자항 상세보기
router.get('/notice/:noticeId', controllers_1.MumentController.getNoticeDetail);
// 뮤멘트 상세보기
router.get('/:mumentId', auth_1.default, controllers_1.MumentController.getMument);
// 뮤멘트 삭제하기
router.delete('/:mumentId', controllers_1.MumentController.deleteMument);
// 신고하기
router.post('/report/:mumentId', [
    (0, express_validator_1.body)('reportCategory').notEmpty(),
], auth_1.default, controllers_1.MumentController.createReport);
// 좋아요를 누른 사용자 조회
router.get('/:mumentId/like', [
    (0, express_validator_1.param)('mumentId').toInt().isInt(),
    (0, express_validator_1.query)('limit').toInt().isInt(),
    (0, express_validator_1.query)('offset').toInt().isInt(),
], auth_1.default, controllers_1.MumentController.getLikeUserList);
exports.default = router;
//# sourceMappingURL=MumentRouter.js.map