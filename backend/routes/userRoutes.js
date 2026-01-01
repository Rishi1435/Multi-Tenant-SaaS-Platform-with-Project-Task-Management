const router = require('express').Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('tenant_admin', 'super_admin'), userController.getTenantUsers);
router.post('/', authorize('tenant_admin'), userController.createUser);
router.delete('/:id', authorize('tenant_admin'), userController.deleteUser); // <--- ADD THIS

module.exports = router;