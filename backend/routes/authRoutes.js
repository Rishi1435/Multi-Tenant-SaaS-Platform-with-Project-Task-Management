const router = require('express').Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // We will create this next

router.post('/register-tenant', authController.registerTenant);
router.post('/login', authController.login);

// Protected Route
router.get('/me', protect, authController.getMe);

module.exports = router;