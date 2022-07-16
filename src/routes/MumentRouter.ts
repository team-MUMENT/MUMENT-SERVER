import { Router } from 'express';
import { MumentController } from '../controllers';
import { body, param, query } from 'express-validator';


const router: Router = Router();

router.post('/:userId/:musicId', MumentController.createMument);
router.get('/:mumentId/:userId', MumentController.getMument);

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

export default router;
