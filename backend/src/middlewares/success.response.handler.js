function successResponse(res, message, statusCode, data) {
  return res.status(Number(statusCode)).json({
    success: true,
    message,
    data,
  })
}

module.exports = successResponse