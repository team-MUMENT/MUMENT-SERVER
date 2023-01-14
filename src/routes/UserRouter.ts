import { Router } from 'express';
import { body, param } from 'express-validator';
import { UserController } from '../controllers';
import auth from '../middlewares/auth';

const router: Router = Router();

router.get('/my/list', auth, UserController.getMyMumentList);
router.get('/like/list', auth, UserController.getLikeMumentList);

router.post('/block/:mumentId', auth, UserController.blockUser);
router.delete('/block/:blockedUserId', auth, UserController.deleteBlockUser);
router.get('/block', auth, auth, UserController.getBlockedUserList);

router.get('/news/exist', auth, UserController.getUnreadNewsisExist);
router.patch('/news/read', auth, UserController.updateUnreadNews);
router.patch('/news/:newsId', auth, UserController.deleteNews);
router.get('/news', auth, UserController.getNewsList);

export default router;
