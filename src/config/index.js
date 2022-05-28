const dotenv = require("dotenv");

dotenv.config();

// .env 파일 만들어서 쓰면됩니다.
export default {
  port: process.env.PORT,
};
