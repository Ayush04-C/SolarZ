const errorHandler = (err, req, res, next) => {
  // console.error(err.stack); // Commented out to prevent noisy backend logs for standard errors
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
