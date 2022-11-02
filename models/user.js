const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return res.status(400).send('message or email empty');
      }
      return bcrypt.compare(password, user.password).then((match) => {
        if (!match) {
          return res.status(400).send('message or email1 empty');
        }
        return user;
      });
    });
};
module.exports = mongoose.model('user', userSchema);
