import { Router } from 'express';
import { UserController } from '../controllers';
import { body, param, query } from 'express-validator';
import auth from '../middlewares/auth';
import upload from '../middlewares/uploadImage';

const router: Router = Router();

// 프로필 설정
router.put('/profile', upload.single('image'), [
    body('profileId').notEmpty().isString(),
], auth, UserController.putProfile);

// 닉네임 중복 확인
router.get('/profile/check/:profileId', [
    param('profileId').isString(),
], auth, UserController.checkDuplicateName);

// 보관함 나의 뮤멘트 조회
router.get('/my/list', auth, UserController.getMyMumentList);

// 보관함 좋아요 뮤멘트 조회
router.get('/like/list', auth, UserController.getLikeMumentList);

// 유저 차단
router.post('/block/:mumentId', auth, UserController.blockUser);

// 유저 차단 해제
router.delete('/block/:blockedUserId', auth, UserController.deleteBlockUser);

// 차단 유저 조회
router.get('/block', auth, auth, UserController.getBlockedUserList);

// 탈퇴 사유 등록
router.post('/leave-category', [
    body('leaveCategoryId').toInt().isInt(),
], auth, UserController.postLeaveCategory);

// 유저 탈퇴
router.delete('/', auth, UserController.deleteUser);

export default router;
