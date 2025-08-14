
const errorHandler = (err, req, res, next) => {
  console.error(err); // Optional: log for debugging

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong",
    errors: err.errors || []
  });
};

export { errorHandler };
