const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-unresolved
const { errors, celebrate, Joi } = require('celebrate');
const routesCards = require('./routes/cards');
const routesUsers = require('./routes/users');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const errorServer = require('./middlewares/error');
const NotFoundError = require('./errors/NotFoundError');

const { PORT = 4000, MONGO_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

mongoose.connect(MONGO_URL, { useNewUrlParser: true });

const app = express();
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().regex(
        /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-/])*)?/,
      ),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

app.use(auth);
app.use('/cards', routesCards);
app.use('/users', routesUsers);

app.use('*', auth, (req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});
app.use(errors());
app.use((err, req, res, next) => { errorServer(err, res, next); });

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
