import { Router } from 'express';
import { body, param } from 'express-validator';
import { UserController } from '../controllers';
import auth from '../middlewares/auth';
import upload from '../middlewares/uploadImage';

const router: Router = Router();

// 프로필 설정
router.put('/profile', upload.single('image'), [
    body('userName').notEmpty().isString(),
], auth, UserController.putProfile);

// 닉네임 중복 확인
router.get('/profile/check/:userName', auth, UserController.checkDuplicateName);

// 보관함 나의 뮤멘트 조회
router.get('/my/list', auth, UserController.getMyMumentList);

// 보관함 좋아요 뮤멘트 조회
router.get('/like/list', auth, UserController.getLikeMumentList);

// 유저 차단
router.post('/block/:mumentId', auth, UserController.blockUser);

// 유저 차단 해제
router.delete('/block/:blockedUserId', auth, UserController.deleteBlockUser);


// 차단 유저 조회
router.get('/block', auth, UserController.getBlockedUserList);

// 신고 제재 기간인지 조회
router.get('/report/restrict', auth, UserController.getIsReportRestrictedUser);

// 안읽은 알림 유무 조회
router.get('/news/exist', auth, UserController.getUnreadNewsisExist);

// 새로운 안읽은 알림 읽음 처리
router.patch('/news/read', auth, UserController.updateUnreadNews);

// 알림 제거
router.patch('/news/:newsId', auth, UserController.deleteNews);

// 소식창 리스트 조회
router.get('/news', auth, UserController.getNewsList);

// 탈퇴 사유 등록
router.post('/leave-category', [
    body('leaveCategoryId').toInt().isInt(),
], auth, UserController.postLeaveCategory);

// 유저 탈퇴 후 소셜 로그인까지 끊기 (NEW)
router.post('/leave', auth, UserController.deleteUserAndRevokeSocial);

// 유저 탈퇴
router.delete('/', auth, UserController.deleteUser);


// 프로필 설정 완료 조회
router.get('/profile/check', auth, UserController.checkProfileSet);

// 공지사항 등록 - 서버, 기획에서만 사용
router.post('/notice', UserController.postNotice);

// 유저 정보 조회
router.get('/profile', auth, UserController.getUser);

// 웹뷰 링크 조회
router.get('/webview-link', UserController.getWebviewLink);

export default router;
