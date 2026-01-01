const router = require('express').Router();
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);


router.route('/')
  .get(projectController.getProjects)
  .post(projectController.createProject);

router.route('/:id')
  .put(projectController.updateProject)
  .delete(projectController.deleteProject);


router.route('/:projectId/tasks')
  .post(taskController.createTask)
  .get(taskController.getTasksByProject);

module.exports = router;