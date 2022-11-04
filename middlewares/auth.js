const jwt = require('jsonwebtoken');
const { SECRET_JWT } = require('../utils/constants');

const handleAuthError = (res) => {
  res.status(401).send({ message: 'Необходима авторизация' });
};

const extractBearerToken = (header) => header.replace('Bearer ', '');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const tokenIs = req.headers.authorization;

  if (!tokenIs) {
    return res.status(401).send({ message: 'Необходима авторизация1111' });
  }

  const token = extractBearerToken(tokenIs);
  let payload;

  try {
    payload = jwt.verify(token, SECRET_JWT);
  } catch (err) {
    return handleAuthError(res);
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
