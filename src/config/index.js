import dotenv from "dotenv";

dotenv.config();

// .env 파일 만들어서 쓰면됩니다.
export default {
  PORT: process.env.PORT,
  REDIS_URL: process.env.REDIS_URL,
  JWT_ACCESS_SECRET_KEY: process.env.JWT_ACCESS_SECRET_KEY,
};
