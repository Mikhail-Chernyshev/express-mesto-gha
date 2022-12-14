const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');
// const jwt = require('jsonwebtoken')
const User = require('../models/user');
const { signToken } = require('../utils/jwt');
const CastError = require('../errors/CastError');
const AuthError = require('../errors/AuthError');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');

const getMe = (req, res, next) => {
  // const { email } = req.body;
  // User.findOne({ email })
  User.findById(req.user)
    .then((user) => {
      // console.log(req)
      if (!user) {
        return next(new CastError('Not correct data'));
      }
      return res.status(200).send(
        user,
      );
    })
    .catch((err) => next(err));
};

// eslint-disable-next-line consistent-return
const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return next(new AuthError('Wrong email or password'));
      }
      // eslint-disable-next-line consistent-return
      bcrypt.compare(password, user.password).then((match) => {
        if (!match) { return next(new AuthError('Wrong email or password')); }
        const token = signToken(user.id);
        res
          .status(200)
          // .cookie('authorization', result, {
          //   maxAge: 3600000 * 24 * 7,
          //   httpOnly: true,
          // })
          .send({ token, message: 'Athorization successful' });
        // console.log(req);

        if (!token) return next(new AuthError('Wrong email or password'));
      });
    })
    .catch((err) => next(err));
};

// eslint-disable-next-line consistent-return
const createUser = async (req, res, next) => {
  const { body } = req;
  const {
    email, password, name, about, avatar,
  } = body;

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.findOne({ email });
    if (user) {
      next(new CastError('???????????????????????? ?? ?????????? email ?????? ??????????????????????????????'));
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
      return next(new ValidationError('Wrong name'));
    }
    if (err.code === 11000) {
      return next(new CastError('???????????????????????? ?? ?????????? email ?????? ??????????????????????????????'));
    }
    next(err);
  }
};

// eslint-disable-next-line consistent-return
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (err) {
    next(err);
  }
};

// eslint-disable-next-line consistent-return
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user == null) {
      return next(new NotFoundError('User with this id not found'));
    }
    return res.send(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return next(new CastError('Not correct data'));
    }
    next(err);
  }
};

// eslint-disable-next-line consistent-return
const updateUser = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user,
      { name, about },
      { new: true, runValidators: true },
    );
    if (user == null) {
      return next(new NotFoundError('User with this id not found'));
    }
    return res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return next(new CastError('Not correct data'));
    }
    if (err.name === 'ValidationError') {
      return next(new CastError('Not correct data'));
    }
    next(err);
  }
};

// eslint-disable-next-line consistent-return
const updateAvatar = async (req, res, next) => {
  const { avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user,
      { avatar },
      { new: true, runValidators: true },
    );
    if (user == null) {
      return next(new NotFoundError('User with this id not found'));
    }
    return res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new NotFoundError('User with this id not found'));
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
