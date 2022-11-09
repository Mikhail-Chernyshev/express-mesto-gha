const { mongoose } = require('mongoose');
const Card = require('../models/card');
const CastError = require('../errors/CastError');
const NotFoundError = require('../errors/NotFoundError');
const AccessError = require('../errors/AccessError');

// eslint-disable-next-line consistent-return
const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (err) {
    next(err);
  }
};

// eslint-disable-next-line consistent-return
const createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const owner = req.user;
    const card = await Card.create({ name, link, owner });
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return next(new CastError('Not correct data'));
    }
    next(err);
  }
};

// eslint-disable-next-line consistent-return
const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (card == null) {
      return next(new NotFoundError('Card with this id not found'));
    }
    if (card.owner._id.toString() !== req.user.toString()) {
      return next(new AccessError('You can not delete this card'));
    } await card.remove();
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return next(new NotFoundError('Card with this id not found'));
    }
    next(err);
  }
};

// eslint-disable-next-line consistent-return
const addLike = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (card == null) {
      return next(new NotFoundError('Card with this id not found'));
    }
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return next(new CastError('Not correct data'));
    }
    next(err);
  }
};

// eslint-disable-next-line consistent-return
const removeLike = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (card == null) {
      return next(new NotFoundError('Card with this id not found'));
    }
    return res.send(card);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return next(new CastError('Not correct data'));
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
