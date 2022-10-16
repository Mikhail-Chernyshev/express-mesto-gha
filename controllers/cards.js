const { mongoose } = require('mongoose');
const {
  WRONG_DATA_CODE,
  WRONG_ID_CODE,
  ERROR_SERVER_CODE,
} = require('../utils/constants');
const Card = require('../models/card');

const getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (err) {
    return res.status(ERROR_SERVER_CODE).send({ message: 'Error on server' });
  }
};

const createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const owner = req.user._id;
    const card = await Card.create({ name, link, owner });
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(WRONG_DATA_CODE).send({ message: 'Not correct data' });
    }
    return res.status(ERROR_SERVER_CODE).send({ message: 'Error on server' });
  }
};

// eslint-disable-next-line consistent-return
const deleteCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndRemove(req.params.cardId);
    if (card == null) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: 'Card with this id not found' });
    }
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return res
        .status(WRONG_DATA_CODE)
        .send({ message: 'Card with this id not found' });
    }
  }
};

const addLike = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (card == null) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: 'Card with this id not found' });
    }
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return res.status(WRONG_DATA_CODE).send({ message: 'NOT CORRECT DATA' });
    }
    return res.status(ERROR_SERVER_CODE).send({ message: 'Error on server' });
  }
};

const removeLike = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (card == null) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: 'Card with this id not found' });
    }
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return res.status(WRONG_DATA_CODE).send({ message: 'NOT CORRECT DATA' });
    }
    return res.status(ERROR_SERVER_CODE).send({ message: 'Error on server' });
  }
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  addLike,
  removeLike,
};
