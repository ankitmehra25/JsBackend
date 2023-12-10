export const asyncHandler = fn => async (err, req, res, next) => {
  try {
    await fn(err, req, res, next);
  } catch (error) {
    // res.status(error.code || 500).json({
    //   success: false,
    //   message: error.message,
    // });
    next(error);
  }
};

export const asyncHandler2 = fn => {
  (err, req, res, next) => {
    Promise.resolve(fn(err, req, res, next)).catch(err => next(err));
  };
};
