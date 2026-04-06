import { Router } from 'express';
import * as contactController from '../controllers/contactController';

const router = Router();

router.post('/bulk', contactController.bulkCreateContacts);
router.post('/bulk-delete', contactController.bulkDeleteContacts);
router.get('/count', contactController.getContactsCount);
router.get('/search', contactController.searchContacts);
router.get('/:id/children', contactController.getContactChildren);
router.get('/:id', contactController.getContactById);
router.get('/', contactController.getContacts);
router.post('/', contactController.createContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

export default router;
