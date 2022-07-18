import { Router } from 'express';
import { UserController } from '../controllers';

const router: Router = Router();

router.get('/my/:userId/list', UserController.getMyMumentList);
router.get('/like/:userId/list', UserController.getLikeMumentList);

// 로그인
router.post('/auth/longin', [
    body('profileId').notEmpty().isString(), 
    body('password').notEmpty().isString(),
], UserController.login);

export default router;
