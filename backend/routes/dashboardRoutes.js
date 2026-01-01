const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, dashboardController.getDashboardStats);

module.exports = router;