const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/tenants', require('./tenantRoutes'));
router.use('/projects', require('./projectRoutes'));
router.use('/tasks', require('./taskRoutes'));

module.exports = router;