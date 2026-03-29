const taskService = require('../services/taskService');
const catchAsync = require('../utils/catchAsync');

class TaskController {
  // @desc    Create new task
  // @route   POST /api/v1/tasks
  // @access  Private (User/Admin)
  createTask = catchAsync(async (req, res, next) => {
    // req.user is set by authMiddleware
    const task = await taskService.createTask(req.user._id, req.body);

    res.status(201).json({
      status: 'success',
      data: {
        task
      }
    });
  });

  // @desc    Get all tasks for a user
  // @route   GET /api/v1/tasks
  // @access  Private (User/Admin)
  getTasks = catchAsync(async (req, res, next) => {
    const tasks = await taskService.getTasks(req.user);

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks
      }
    });
  });

  // @desc    Get single task
  // @route   GET /api/v1/tasks/:id
  // @access  Private (User/Admin)
  getTaskById = catchAsync(async (req, res, next) => {
    const task = await taskService.getTaskById(req.params.id, req.user);

    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  });

  // @desc    Update task
  // @route   PUT /api/v1/tasks/:id
  // @access  Private (User/Admin)
  updateTask = catchAsync(async (req, res, next) => {
    const task = await taskService.updateTask(req.params.id, req.body, req.user);

    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  });

  // @desc    Delete task
  // @route   DELETE /api/v1/tasks/:id
  // @access  Private (User/Admin)
  deleteTask = catchAsync(async (req, res, next) => {
    await taskService.deleteTask(req.params.id, req.user);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
}

module.exports = new TaskController();
