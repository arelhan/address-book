import { Router } from 'express';
import * as authController from '../controllers/authController';
import { requireAuth, requireRole } from '../lib/auth';

const router = Router();

router.post('/login', authController.login);
router.get('/setup/status', authController.setupStatus);
router.post('/setup', authController.setupInitialSuperAdmin);
router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);
router.post('/password-reset/request', authController.requestPasswordReset);
router.post('/password-reset/confirm', authController.resetPassword);
router.get('/users', requireAuth, requireRole('SUPER_ADMIN'), authController.listUsers);
router.post('/users', requireAuth, requireRole('SUPER_ADMIN'), authController.createUser);
router.put('/users/:id', requireAuth, requireRole('SUPER_ADMIN'), authController.updateUser);
router.delete('/users/:id', requireAuth, requireRole('SUPER_ADMIN'), authController.deleteUser);
router.get('/logs', requireAuth, requireRole('SUPER_ADMIN'), authController.listAuditLogs);

export default router;
