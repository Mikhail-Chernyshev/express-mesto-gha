const validator = require('validator');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
      minlength: 2,
      maxlength: 30,
      default: 'Жак-Ив Кусто',
    },
    about: {
      type: String,
      required: false,
      minlength: 2,
      maxlength: 30,
      default: 'Исследователь',
    },
    avatar: {
      type: String,
      required: false,
      default:
        'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
      validate: {
        validator(v) {
          return /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-/]))?/.test(
            v,
          );
        },
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: { validator: (v) => validator.isEmail(v) },
    },
    password: {
      type: String,
      required: true,
      select: false, // необходимо добавить поле select
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model('user', userSchema);
