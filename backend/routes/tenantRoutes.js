const router = require('express').Router();
const { getAllTenants } = require('../controllers/tenantController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only Super Admin can view all tenants
router.get('/', protect, authorize('super_admin'), getAllTenants);

module.exports = router;