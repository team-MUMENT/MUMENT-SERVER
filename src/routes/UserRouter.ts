import { Router } from 'express';
import { UserController } from '../controllers';
import { body, param, query } from 'express-validator';
import auth from '../middlewares/auth';
import upload from '../middlewares/uploadImage';

const router: Router = Router();

router.put('/profile', upload.single('image'), [
    body('profileId').notEmpty().isString(),
], auth, UserController.putProfile);
router.get('/profile/check/:profileId', [
    param('profileId').isString(),
], auth, UserController.checkDuplicateName)
router.get('/my/list', auth, UserController.getMyMumentList);
router.get('/like/list', auth, UserController.getLikeMumentList);
router.post('/block/:mumentId', auth, UserController.blockUser);
router.delete('/block/:blockedUserId', auth, UserController.deleteBlockUser);
router.get('/block', auth, auth, UserController.getBlockedUserList);
router.post('/leave-category', [
    body('leaveCategoryId').toInt().isInt(),
], auth, UserController.postLeaveCategory);

export default router;
