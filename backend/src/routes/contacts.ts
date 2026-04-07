import { Router } from 'express';
import * as contactController from '../controllers/contactController';
import { requireAuth, requireRole } from '../lib/auth';

const router = Router();

router.use(requireAuth);

router.get('/count', contactController.getContactsCount);
router.get('/deleted/count', requireRole('SUPER_ADMIN'), contactController.getDeletedContactsCount);
router.get('/deleted', requireRole('SUPER_ADMIN'), contactController.getDeletedContacts);
router.get('/search', contactController.searchContacts);
router.get('/:id/children', contactController.getContactChildren);
router.get('/:id', contactController.getContactById);
router.get('/', contactController.getContacts);

router.use(requireRole('ADMIN', 'SUPER_ADMIN'));

router.post('/bulk', contactController.bulkCreateContacts);
router.post('/bulk-delete', contactController.bulkDeleteContacts);
router.post('/', contactController.createContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);
router.post('/:id/restore', requireRole('SUPER_ADMIN'), contactController.restoreContact);

export default router;
