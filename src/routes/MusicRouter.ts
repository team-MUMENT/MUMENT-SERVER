import { Router } from 'express';
import { MusicController } from '../controllers';
import { body, param, query } from 'express-validator';

const router: Router = Router();

router.get('/:musicId/:userId', [
    param('musicId').isString().isLength({min: 24, max: 24}), 
    param('userId').isString().isLength({min: 24, max: 24}),
], MusicController.getMusicAndMyMument);

router.get('/:musicId/:userId/order', [
    param('musicId').isString().isLength({min: 24, max: 24}), 
    param('userId').isString().isLength({min: 24, max: 24}),
    query('default').isString().isIn(['Y', 'N']),
], MusicController.getMumentList);

router.get('/search', MusicController.getMusicListBySearch);

export default router;
