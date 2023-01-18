import { Router } from 'express';
import { MusicController } from '../controllers';
import { body, param, query } from 'express-validator';
import auth from '../middlewares/auth';

const router: Router = Router();

router.get('/search', MusicController.getMusicListBySearch);

router.get('/:musicId', [
    param('musicId').toInt().isInt(), 
], auth, MusicController.getMusicAndMyMument);

router.get('/:musicId/order', [
    param('musicId').toInt().isInt(), 
    query('default').isString().isIn(['Y', 'N']),
    query('limit').toInt().isInt(),
    query('offset').toInt().isInt(),
], auth, MusicController.getMumentList);

export default router;
