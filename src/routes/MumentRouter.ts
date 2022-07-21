import { Router } from 'express';
import { MumentController } from '../controllers';
import { body, param, query } from 'express-validator';

const router: Router = Router();

router.post('/:userId/:musicId', MumentController.createMument);

router.put('/:mumentId', [
    body('isFirst').notEmpty(),
    body('impressionTag').notEmpty(),
    body('feelingTag').notEmpty(),
], MumentController.updateMument);
router.get('/:mumentId/:userId', MumentController.getMument);
router.get('/:userId/:musicId/is-first', MumentController.getIsFirst);

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

export default router;
