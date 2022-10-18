const express = require('express');
const mongoose = require('mongoose');
const { WRONG_ID_CODE } = require('./utils/constants');
const routesCards = require('./routes/cards');
const routesUsers = require('./routes/users');

const { PORT = 3000, MONGO_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

mongoose.connect(MONGO_URL);

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '634aa97b9b2f74fa1af36789',
  };
  next();
});

app.use(routesCards);
app.use(routesUsers);
app.use('*', (req, res) => {
  res.status(WRONG_ID_CODE).send({ message: 'PAGE NOT FOUND' });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
