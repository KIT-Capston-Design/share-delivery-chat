import expressLoader from "./express.js";
import socketioLoader from "./socket.io.js";
import redis from "./redis.js";

export default async ({ expressApp, httpServer }) => {
  //redis init
  try {
    await redis.init();
    console.log("Redis Intialized");
  } catch (error) {
    console.log(error.message);
  }

  await expressLoader({ app: expressApp });
  console.log("Express Intialized");

  await socketioLoader({ httpServer });
  console.log("Socket.IO Intialized");
};
