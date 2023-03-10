import { Router } from 'express';
import auth from '../middlewares/auth'
import { AuthController } from '../controllers';
import { body } from 'express-validator';

const router: Router = Router();

// 소셜 로그인/회원가입
router.post('/login', AuthController.login);

// 액세스 토큰 재발급
router.get('/token', auth, AuthController.getNewAccessToken);

// 로그아웃
router.post('/logout', auth, AuthController.logout);

// 어드민 로그인
router.post('/admin/login', [
    body('id').notEmpty().toInt(),
    body('userName').notEmpty(),
    body('provider').notEmpty().contains('admin'),
], AuthController.adminLogin);

export default router;
