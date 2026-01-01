const router = require('express').Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register-tenant', authController.registerTenant);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;