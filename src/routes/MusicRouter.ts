import { Router } from 'express';
import { MusicController } from '../controllers';
import { body, param, query } from 'express-validator';
import auth from '../middlewares/auth';

const router: Router = Router();

router.get('/search', MusicController.getMusicListBySearch);

router.post('/:musicId', [
    param('musicId').toInt().isInt(),
    body('musicId').notEmpty(),
    body('musicArtist').notEmpty(),
    body('musicImage').notEmpty(),
    body('musicName').notEmpty(),
], auth, MusicController.getMusicAndMyMument);

router.get('/:musicId/order', [
    param('musicId').toInt().isInt(), 
    query('default').isString().isIn(['Y', 'N']),
    query('limit').toInt().isInt(),
    query('offset').toInt().isInt(),
], auth, MusicController.getMumentList);

export default router;
