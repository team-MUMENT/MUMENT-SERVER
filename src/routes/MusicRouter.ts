import { Router } from 'express';
import { MusicController } from '../controllers';
import { body, param } from 'express-validator';

const router: Router = Router();

router.get('/:musicId/:userId', [param('musicId').isLength(24), param('userId').isLength(24)], MusicController.getMusicAndMyMument);

export default router;
