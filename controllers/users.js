const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');
const {
  WRONG_DATA_CODE,
  WRONG_ID_CODE,
  ERROR_SERVER_CODE,
} = require('../utils/constants');
const User = require('../models/user');
const { signToken } = require('../utils/jwt');

const getMe = (req, res, next) => {
  User.findById(req.user)
    .then((user) => {
      if (!user) {
        return res.status(401).send('Not correct data');
      }
      return res.status(200).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
        _id: user._id,
      });
    })
    .catch((err) => next(err));
};

// eslint-disable-next-line consistent-return
const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) { return res.status(400).send({ message: 'Password or email empty' }); }

  User.findOne({ email })
    .select('+password')
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return res.status(401).send({ message: 'Wrong email or password' });
      }
      // eslint-disable-next-line consistent-return
      bcrypt.compare(password, user.password).then((match) => {
        if (!match) { return res.status(401).send({ message: 'Wrong password or email' }); }
        const result = signToken(user.id);
        res
          .status(200)
          .cookie('authorization', result, {
            maxAge: 3600000 * 24 * 7,
            httpOnly: true,
          })
          .send({ result, message: 'Athorization successful' });

        if (!result) return res.status(500).send({ message: 'Token wrong' });
      });
    })
    .catch((err) => next(err));
};

// eslint-disable-next-line consistent-return
const createUser = async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      message: 'Логин и пароль обязательны для заполнения',
    });
  }
  const { body } = req;
  const {
    email, password, name, about, avatar,
  } = body;

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
        message: 'Wrong name',
      });
    }
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (err) {
    next(err)
  }
};

const getUser = async (req, res, next) => {
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
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user,
      { name, about },
      { new: true, runValidators: true },
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
      return res.status(WRONG_DATA_CODE).send({ message: 'Not correct data' });
    }
    next(err);
  }
};

const updateAvatar = async (req, res, next) => {
  const { avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user,
      { avatar },
      { new: true, runValidators: true },
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
    next(err);
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
