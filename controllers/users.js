const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
// const { NODE_ENV, JWT_SECRET } = process.env;
const { default: mongoose } = require('mongoose');
const {
  WRONG_DATA_CODE,
  WRONG_ID_CODE,
  ERROR_SERVER_CODE,
} = require('../utils/constants');
const User = require('../models/user');
const { signToken } = require('../utils/jwt');
// const { request } = require('express');
// const { SECRET_JWT } = require('../utils/constants');

const getMe = (req, res) => {
  console.log(req.params);
  User.findById(req.user)
    .then((user) => {
      if (!user) {
        return res.status(401).send('pipka');
      }
      return res.status(200).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
        _id: user._id,
      });
    })
    .catch((err) => {
      return console.log('pipla');
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).send({ message: 'password or email empty' });

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return res.status(401).send({ message: 'wrong email or password' });
      }
      bcrypt.compare(password, user.password).then((match) => {
        if (!match)
          return res.status(401).send({ message: 'wrong password or email' });
        const result = signToken(user.id);
        res
          .status(200)
          .cookie('authorization', result, {
            maxAge: 3600000 * 24 * 7,
            // httpOnly: true,
          })
          .send({ result, message: 'Athorization successful' });

        if (!result) return res.status(500).send({ message: 'token error' });
        // return res.status(200).send( result );
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
  // return res.status(200).send('hello from auth');
};

// eslint-disable-next-line consistent-return
const createUser = async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      message: 'Логин и пароль обязательны для заполнения',
    });
  }
  const { email, password, name, about, avatar } = req.body;

  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.findOne({ email });

    if (user) {
      res
        .status(409)
        .json({ message: 'Пользователь с таким email уже зарегистрирован' });
    } else {
      await User.create({
        email,
        password: hashPassword,
        name,
        about,
        avatar,
      });
      res.status(200).send({
        user: {
          email,
          name,
          about,
          avatar,
        },
      });
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'неверное имя',
      });
    }
    next(err);
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (err) {
    return res.status(ERROR_SERVER_CODE).send({ message: 'Error on server' });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user == null) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: 'User with this id not found' });
    }
    return res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return res.status(WRONG_DATA_CODE).send({ message: 'Not correct data' });
    }
    return res.status(ERROR_SERVER_CODE).send({ message: 'Error on server' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user,
      { name, about },
      { new: true, runValidators: true }
    );
    if (user == null) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: 'User with this id not found' });
    }
    return res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return res.status(WRONG_DATA_CODE).send({ message: 'Not correct data' });
    }
    if (err.name === 'ValidationError') {
      return res
        .status(WRONG_DATA_CODE)
        .send({ message: 'Not correctttt data' });
    }
    return res.status(ERROR_SERVER_CODE).send({ message: 'Error on server' });
  }
};

const updateAvatar = async (req, res) => {
  const { avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user,
      { avatar },
      { new: true, runValidators: true }
    );
    if (user == null) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: 'User with this id not found' });
    }
    return res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res
        .status(WRONG_DATA_CODE)
        .send({ message: 'User with this id not found' });
    }
    return res.status(ERROR_SERVER_CODE).send({ message: 'Error on server' });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  updateAvatar,
  login,
  getMe,
};
