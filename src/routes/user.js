import express from 'express';
import { 
  getAllUsers, 
  createUser, 
  updateUserRole, 
  deleteUser 
} from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken, requireAdmin);
router.get('/', getAllUsers);

router.post('/', createUser);

router.put('/:id/role', updateUserRole);

router.delete('/:id', deleteUser);

export default router;