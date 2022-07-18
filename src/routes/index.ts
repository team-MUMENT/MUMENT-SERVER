//router index file
import { Router } from 'express';
import UserRouter from './UserRouter';
import MumentRouter from './MumentRouter';
import MusicRouter from './MusicRouter';

const router = Router();

router.use('/user', UserRouter);
router.use('/mument', MumentRouter);
router.use('/music', MusicRouter);

export default router;
