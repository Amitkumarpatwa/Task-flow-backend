// A wrapper to eliminate the need for try...catch blocks in every async controller function
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
