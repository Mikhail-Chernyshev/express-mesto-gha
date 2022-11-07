const { mongoose } = require('mongoose');
const {
  WRONG_DATA_CODE,
  WRONG_ID_CODE,
  ERROR_SERVER_CODE,
} = require('../utils/constants');
const Card = require('../models/card');

const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (err) {
    next(err);
  }
};

const createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const owner = req.user;
    const card = await Card.create({ name, link, owner });
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(WRONG_DATA_CODE).send({ message: 'Not correct data' });
    }
    next(err);
  }
};

// eslint-disable-next-line consistent-return
const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndRemove(req.params.cardId);
    if (card == null) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: 'Card with this id not found' });
    }
    if (card.owner._id.toString() !== req.user.toString()) {
      return res.status(403).send({ message: 'You can not delete this card' });
    }
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return res
        .status(WRONG_DATA_CODE)
        .send({ message: 'Card with this id not found' });
    }
    next(err);
  }
};

const addLike = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    );
    if (card == null) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: 'Card with this id not found' });
    }
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return res.status(WRONG_DATA_CODE).send({ message: 'Not correct data' });
    }
    next(err);
  }
};

const removeLike = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true }
    );
    if (card == null) {
      return res
        .status(WRONG_ID_CODE)
        .send({ message: 'Card with this id not found' });
    }
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return res.status(WRONG_DATA_CODE).send({ message: 'Not correct data' });
    }
    next(err);
  }
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  addLike,
  removeLike,
};
