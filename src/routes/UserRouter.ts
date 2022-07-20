import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers';

const router: Router = Router();

router.get('/my/:userId/list', UserController.getMyMumentList);
router.get('/like/:userId/list', UserController.getLikeMumentList);

export default router;
