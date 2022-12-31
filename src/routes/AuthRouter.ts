import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers';

const router: Router = Router();

// 소셜 로그인/회원가입
router.post('/login', AuthController.login);

export default router;
