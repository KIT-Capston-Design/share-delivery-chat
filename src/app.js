const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

const morgan = require("morgan");

app.use(morgan("dev")); // logger
app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
