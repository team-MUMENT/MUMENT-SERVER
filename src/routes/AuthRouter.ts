import { Router } from 'express';
import auth from '../middlewares/auth'
import { AuthController } from '../controllers';

const router: Router = Router();

// 소셜 로그인/회원가입
router.post('/login', AuthController.login);

// 액세스 토큰 재발급
router.get('/token', auth, AuthController.getNewAccessToken);

// 로그아웃
router.post('/logout', auth, AuthController.logout);

export default router;
