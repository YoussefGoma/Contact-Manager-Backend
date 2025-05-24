import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getContacts,
  createContact,
  lockContact,
  unlockContact,
  updateContact,
  deleteContact
} from '../controllers/contactController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getContacts);
router.post('/', createContact);
router.post('/:id/lock', lockContact);
router.post('/:id/unlock', unlockContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;