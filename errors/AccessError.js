class AccessError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}
module.exports = AccessError;
