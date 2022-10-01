import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers';

const router: Router = Router();

// 로그인
router.post('/login', [
    body('profileId').notEmpty().isString(), 
    body('password').notEmpty().isString(),
], AuthController.login);

// 애플 로그인
router.post('/apple', [
    body('code').notEmpty(),
    body('identity_token').notEmpty(),
], AuthController.appleSignIn);

export default router;
