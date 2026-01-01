const router = require('express').Router();
const tenantController = require('../controllers/tenantController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply authentication check to all routes
router.use(protect);

// === SUPER ADMIN ROUTES ===
router.get('/', authorize('super_admin'), tenantController.getAllTenants);
router.post('/', authorize('super_admin'), tenantController.createTenant);
router.post('/approve-upgrade', authorize('super_admin'), tenantController.approveUpgrade);

// === TENANT ADMIN ROUTES ===
// Removed the conflicting "upgradePlan" route. 
// Now, PATCH /upgrade ALWAYS triggers "requestUpgrade".
router.patch('/upgrade', authorize('tenant_admin'), tenantController.requestUpgrade);

module.exports = router;