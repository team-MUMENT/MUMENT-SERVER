import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers';

const router: Router = Router();

// 로그인
router.post('/login', [
    body('profileId').notEmpty().isString(), 
    body('password').notEmpty().isString(),
], AuthController.login);

export default router;
