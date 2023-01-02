import { Router } from 'express';
import { MumentController } from '../controllers';
import { body, param, query } from 'express-validator';
import auth from '../middlewares/auth';

const router: Router = Router();

// 뮤멘트 기록하기
router.post('/:userId/:musicId', MumentController.createMument);

// 처음/다시 조회
router.get('/:musicId/is-first', auth, MumentController.getIsFirst);

// 뮤멘트 수정하기
router.put('/:mumentId', [
    body('isFirst').notEmpty(),
], MumentController.updateMument);

// 뮤멘트 상세보기
router.get('/:mumentId/:userId', MumentController.getMument);

//뮤멘트 삭제하기
router.delete('/:mumentId', MumentController.deleteMument);

// 히스토리 조회
router.get('/:userId/:musicId/history', [
    param('musicId').isString().isLength({ min: 24, max: 24 }),
    param('userId').isString().isLength({ min: 24, max: 24 }),
    query('default').isString().isIn(['Y', 'N']),
], MumentController.getMumentHistory);

// 좋아요 등록
router.post('/:mumentId/:userId/like', [
    param('mumentId').isString().isLength({ min: 24, max: 24}),
    param('userId').isString().isLength({ min: 24, max: 24}),
], MumentController.createLike);

// 좋아요 삭제
router.delete('/:mumentId/:userId/like', [
    param('mumentId').isString().isLength({ min: 24, max: 24}),
    param('userId').isString().isLength({ min: 24, max: 24}),
], MumentController.deleteLike);

// 랜덤 뮤멘트
router.get('/random', MumentController.getRandomMument);

// 오늘의 뮤멘트
router.get('/today', MumentController.getTodayMument);

// 배너
router.get('/banner', MumentController.getBanner);

// 다시 들은 뮤멘트
router.get('/again', MumentController.getAgainMument);

export default router;
