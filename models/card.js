const mongoose = require("mongoose");

const { Schema } = mongoose;

const cardSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    default: {},
    required: true,
  },
  likes: {
    type: Object,
    // ref: 'user',
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("card", cardSchema);
