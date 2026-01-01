const router = require('express').Router({ mergeParams: true }); 
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.patch('/:id/status', taskController.updateTaskStatus);


module.exports = router;