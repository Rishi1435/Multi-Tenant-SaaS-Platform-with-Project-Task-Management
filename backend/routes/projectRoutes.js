const router = require('express').Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.route('/')
  .get(projectController.getProjects)
  .post(projectController.createProject);

router.route('/:id')
  .put(projectController.updateProject)
  .delete(projectController.deleteProject);

module.exports = router;