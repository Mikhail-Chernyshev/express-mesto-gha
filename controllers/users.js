const { default: mongoose } = require("mongoose");
const {
  WRONG_DATA_CODE,
  WRONG_ID_CODE,
  ERROR_SERVER_CODE,
} = require("../utils/constants");
const User = require("../models/user");

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    return res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(WRONG_DATA_CODE).send({ message: "Not correct data" });
    }
    return res.status(ERROR_SERVER_CODE).send({ message: "Error on server" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (err) {
    return res.status(ERROR_SERVER_CODE).send({ message: "Error on server" });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    return res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(WRONG_DATA_CODE).send({ message: "Not correct data" });
    }
    if (err instanceof mongoose.Error.CastError) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: "User with this id not found" });
    }
    return res.status(ERROR_SERVER_CODE).send({ message: "Error on server" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true }
    );
    return res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(WRONG_DATA_CODE).send({ message: "Not correct data" });
    }
    if (err instanceof mongoose.Error.CastError) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: "User with this id not found" });
    }
    return res.status(ERROR_SERVER_CODE).send({ message: "Error on server" });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true }
    );
    return res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(WRONG_DATA_CODE).send({ message: "Not correct data" });
    }
    if (err instanceof mongoose.Error.CastError) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: "User with this id not found" });
    }
    return res.status(ERROR_SERVER_CODE).send({ message: "Error on server" });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  updateAvatar,
};
