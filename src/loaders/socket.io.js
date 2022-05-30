import { Server as SocketIO } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config/index.js";

//HMAC256
export default async ({ httpServer }) => {
  const socketioServer = new SocketIO(httpServer);

  // json web token auth
  socketioServer.use(function (socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(
        socket.handshake.query.token,
        config.JWT_ACCESS_SECRET_KEY,
        function (err, decoded) {
          if (err) {
            if (err.name === "TokenExpiredError") {
              console.log("만료된 토큰");
              return next(new Error("Expired Token error"));
            }
            console.log("인증 예외 발생");
            return next(new Error("Authentication error"));
          }
          console.log("Socket.IO client auth success");
          socket.decoded = decoded;
          next();
        }
      );
    } else {
      next(new Error("Authentication error"));
    }
  });

  socketioServer.on("connection", (socket) => {
    socket.onAny((event) => console.log("Socket.IO event received :", event));

    socket.on("enter_room", (roomId, done) => {
      console.log(roomId);

      setTimeout(() => {
        done();
      }, 1000);
    });
  });
};
