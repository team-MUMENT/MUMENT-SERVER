import { Router } from 'express';
import { MusicController } from '../controllers';
import { body, param } from 'express-validator';

const router: Router = Router();

router.get('/:musicId/:userId', [
    param('musicId').isString().isLength({min: 24, max: 24}), 
    param('userId').isString().isLength({min: 24, max: 24}),
], MusicController.getMusicAndMyMument);

export default router;
