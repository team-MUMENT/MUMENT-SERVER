import { Router } from 'express';
import { MumentController } from '../controllers';
import { body, header, param, query } from 'express-validator';
import auth from '../middlewares/auth';

const router: Router = Router();

// 뮤멘트 기록하기
router.post('/:musicId', auth, MumentController.createMument);

// 처음/다시 조회
router.get('/:musicId/is-first', auth, MumentController.getIsFirst);

// 뮤멘트 수정하기
router.put('/:mumentId', [
    body('isFirst').notEmpty(),
], auth, MumentController.updateMument);


// 히스토리 조회
router.get('/:musicId/:userId/history', [
    param('musicId').toInt().isInt(),
    param('userId').toInt().isInt(),
    query('default').isString().isIn(['Y', 'N']),
], auth, MumentController.getMumentHistory);

// 좋아요 등록
router.post('/:mumentId/like', [
    param('mumentId').toInt().isInt(),
], auth, MumentController.createLike);

// 좋아요 삭제
router.delete('/:mumentId/like', [
    param('mumentId').toInt().isInt()
], auth, MumentController.deleteLike);

// 랜덤 뮤멘트
router.get('/random', auth, MumentController.getRandomMument);

// 오늘의 뮤멘트
router.get('/today', auth, MumentController.getTodayMument);

// 배너
router.get('/banner', auth, MumentController.getBanner);

// 다시 들은 뮤멘트
router.get('/again', auth, MumentController.getAgainMument);

// 공시자항 리스트
router.get('/notice', MumentController.getNoticeList);

// 공시자항 상세보기
router.get('/notice/:noticeId', MumentController.getNoticeDetail);

// 뮤멘트 상세보기
router.get('/:mumentId', auth, MumentController.getMument);

// 뮤멘트 삭제하기
router.delete('/:mumentId', MumentController.deleteMument);

// 신고하기
router.post('/report/:mumentId', [
    body('reportCategory').notEmpty(),
], auth, MumentController.createReport);

// 좋아요를 누른 사용자 조회
router.get('/:mumentId/like', [
    param('mumentId').toInt().isInt(),
    query('limit').toInt().isInt(),
    query('offset').toInt().isInt(),
], auth, MumentController.getLikeUserList);

export default router;
