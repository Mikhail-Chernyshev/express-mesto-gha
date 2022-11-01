const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const { NODE_ENV, JWT_SECRET } = process.env;
const { default: mongoose } = require('mongoose');
const {
  WRONG_DATA_CODE,
  WRONG_ID_CODE,
  ERROR_SERVER_CODE,
} = require('../utils/constants');
const User = require('../models/user');

const login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select(+password)
    .then((user) => {
      if (user === null) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' }
      );
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          email: user.email,
          _id: user._id,
        });
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
};

const createUser = async (req, res) => {
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
        .json({ message: 'Пользователь с таким логином уже зарегистрирован' });
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
          email: user.email,
          name: user.name,
          about: user.about,
          avatar: user.avatar,
        },
      });
    }
  } catch (error) {
    res.status(400).end();
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
      req.user._id,
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
    return res.status(ERROR_SERVER_CODE).send({ message: 'Error on server' });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true },
    );
    if (user == null) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: 'User with this id not found' });
    }
    return res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
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
};
