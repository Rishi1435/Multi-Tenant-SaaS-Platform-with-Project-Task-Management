const router = require('express').Router();
const authController = require('../controllers/authController');

router.post('/register-tenant', authController.registerTenant);

module.exports = router;