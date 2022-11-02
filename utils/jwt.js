const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const { SECRET_JWT } = require('./constants');

const signToken = (id) => {
  try {
    const token = jwt.sign(id, SECRET_JWT);
    return token;
  } catch (err) {
    return false;
  }
};

module.exports = {
  signToken,
};
