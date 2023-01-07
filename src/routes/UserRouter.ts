import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers';
import auth from '../middlewares/auth';

const router: Router = Router();

router.get('/my/list', auth, UserController.getMyMumentList);
router.get('/like/list', auth, UserController.getLikeMumentList);
router.post('/block/:mumentId', auth, UserController.blockUser);

export default router;
