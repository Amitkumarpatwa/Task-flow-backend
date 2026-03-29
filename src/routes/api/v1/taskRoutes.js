const express = require('express');
const taskController = require('../../../controllers/taskController');
const { createTaskValidation, updateTaskValidation } = require('../../../validators/taskValidators');
const { protect } = require('../../../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router
  .route('/')
  .post(createTaskValidation, taskController.createTask)
  .get(taskController.getTasks);

router
  .route('/:id')
  .get(taskController.getTaskById)
  .put(updateTaskValidation, taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
