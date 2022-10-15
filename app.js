const express = require("express");
const mongoose = require("mongoose");

const routes = require("./routes/users");

const { PORT = 3000, MONGO_URL = "mongodb://localhost:27017/mestodb" } =
  process.env;

mongoose.connect(MONGO_URL);

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: "634aa97b9b2f74fa1af36771",
  };

  next();
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
