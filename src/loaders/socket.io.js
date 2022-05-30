import { Server as SocketIO } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import redis from "./redis.js";
export default async ({ httpServer }) => {
  const socketioServer = new SocketIO(httpServer);

  //DeliveryRoom 저장 객체
  const roomList = {
    getRoom: async function (roomId) {
      if (this[roomId] === undefined) {
        this[roomId] = await redis.client.hGetAll("activated-delivery-room:" + roomId);

        //방 미존재의 경우 null 반환
        if (this[roomId] === null) {
          console.log("방 미존재");
          return null;
        }

        //유저 id 기록
        this[roomId].users = new Array();
        Object.keys(this[roomId]).forEach((key) => {
          if (key.startsWith("users.[")) {
            const idx = parseInt(key.charAt(7));
            this[roomId].users[idx] = this[roomId][key];
          }
        });

        return this[roomId];
      }
    },
  };

  // json web token auth
  socketioServer.use(jwtAuthentication);
  socketioServer.on("connection", connectionHandler);

  function connectionHandler(socket) {
    socket.onAny((event) => console.log("Socket.IO event received :", event));
    socket.on("enter_room", enterRoomHandler);
  }

  async function enterRoomHandler({ payload: roomId }, done) {
    const room = await roomList.getRoom(roomId);
    if (room === null) done(`DeliveryRoom ${roomId} is not found`);

    done("success");
  }

  function jwtAuthentication(socket, next) {
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
  }
};
