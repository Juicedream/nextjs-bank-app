function catchAllErrorsMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || "Internal Server error";
  const errorStack = err.stack;
  const requestPath = req.url;
  const timeStamp = new Date().toISOString();


  console.error(`[Error ${statusCode}]:`, errorStack);

  res.status(statusCode).json({
    success: false,
    statusCode,
    error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
    path: requestPath,
    timeStamp,
  })
}

// Note this function must be passed to an express next function
function throwError(errorMessage, statusCode) {
  const err = new Error(errorMessage);
  err.statusCode = Number(statusCode);
  return err;
  
}

module.exports = {
  catchAllErrorsMiddleware,
  throwError
}