const jwt = require('jsonwebtoken');
const { SECRET_JWT } = require('../utils/constants');
const AuthError = require('../errors/AuthError');

// const handleAuthError = (res) => {
//   res.status(401).send({ message: 'Необходима авторизация' });
// };

const extractBearerToken = (header) => header.replace('Bearer ', '');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const tokenIs = req.cookies.authorization;

  if (!tokenIs) {
    return next(new AuthError('You are not authorized'));
  }

  const token = extractBearerToken(tokenIs);
  let payload;

  try {
    payload = jwt.verify(token, SECRET_JWT);
  } catch (err) {
    return next(new AuthError('You are not authorized'));
  }
  req.user = payload;

  next();
};
