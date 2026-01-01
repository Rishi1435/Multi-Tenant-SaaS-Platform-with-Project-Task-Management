const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/tenants', require('./tenantRoutes'));

module.exports = router;