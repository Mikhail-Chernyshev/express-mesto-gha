const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-unresolved
const { celebrate, Joi } = require('celebrate');
const { WRONG_ID_CODE } = require('./utils/constants');
const routesCards = require('./routes/cards');
const routesUsers = require('./routes/users');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');

const { PORT = 3000, MONGO_URL = 'mongodb://localhost:27017/mestodb' } =
  process.env;

mongoose.connect(MONGO_URL, { useNewUrlParser: true });

const app = express();
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json());
app.post('/signin', login);
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().regex(
        /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-/])*)?/
      ),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);
app.use(auth);
app.use(routesCards);
app.use(routesUsers);

app.use('*', (req, res) => {
  res.status(WRONG_ID_CODE).send({ message: 'PAGE NOT FOUND' });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
