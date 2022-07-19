//router index file
import { Router } from 'express';
import UserRouter from './UserRouter';
import MumentRouter from './MumentRouter';
import MusicRouter from './MusicRouter';
import AuthRouter from './AuthRouter';

const router = Router();

router.use('/user', UserRouter);
router.use('/mument', MumentRouter);
router.use('/music', MusicRouter);
router.use('/auth', AuthRouter);

export default router;
