import { Router } from 'express';
import { MumentController } from '../controllers';
import { body, header, param, query } from 'express-validator';

const router: Router = Router();

router.post('/:userId/:musicId', MumentController.createMument);

router.put('/:mumentId', [
    body('isFirst').notEmpty(),
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
router.post('/:mumentId/like', [
    param('mumentId').toInt().isInt(),
    header('bearer').notEmpty().isString(),
], MumentController.createLike);

// 좋아요 삭제
router.delete('/:mumentId/:userId/like', [
    param('mumentId').toInt().isInt(),
    header('bearer').notEmpty().isString(),
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
