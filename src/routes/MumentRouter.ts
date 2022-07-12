import { Router } from 'express';
import { MumentController } from '../controllers';

const router: Router = Router();

router.post('/:userId/:musicId', MumentController.createMument);

export default router;