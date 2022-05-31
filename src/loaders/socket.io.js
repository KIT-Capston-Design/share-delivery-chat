import { createRequire } from "module";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import redis from "./redis.js";

const require = createRequire(import.meta.url);
const SocketIO = require("socket.io");

export default async ({ httpServer }) => {
  const socketioServer = new SocketIO(httpServer);

  //DeliveryRoom 저장 객체
  const roomList = {
    getRoom: async function (roomId) {
      if (typeof this[roomId] === "undefined") {
        const room = await redis.client.hGetAll("activated-delivery-room:" + roomId);

        //방 미존재의 경우 null 반환
        if (
          room === null ||
          (room &&
            Object.keys(room).length === 0 &&
            (room.constructor === Object || room.constructor === undefined))
        ) {
          return null;
        }

        //유저 id 기록
        room.users = new Array();
        Object.keys(room).forEach((key) => {
          if (key.startsWith("users.[")) {
            const idx = parseInt(key.charAt(7));
            room.users[idx] = room[key];
          }
        });

        this[roomId] = room;

        return room;
      }
    },
    amIParticipant: function (roomId, accountId) {
      for (var participantId of this[roomId].users) {
        if (participantId == accountId) return true;
      }
      return false;
    },
  };

  // json web token auth
  socketioServer.use(jwtAuthentication);

  socketioServer.on("connection", connectionHandler);

  function connectionHandler(socket) {
    socket.use((packet, next) => {
      console.log("Socket.IO event received :", packet);
      next();
    });
    socket.on("enter_room", enterRoomHandler);

    async function enterRoomHandler({ payload: roomId }, done) {
      const room = await roomList.getRoom(parseInt(roomId));

      //해당하는 방이 존재하지 않을 경우 작업 종료
      if (room === null) {
        done(`DeliveryRoom ${roomId} is not found`);
        return;
      }

      //참여 권한 체크 (api 서버에서 모집글에 참여 중인지)
      if (!roomList.amIParticipant(parseInt(roomId), socket.decoded.accountId)) {
        done(`You don't have permission to enter delivery chat room ${roomId} `);
      }

      //방 입장
      socket.join(roomId);

      done("success");
    }
  }

  function jwtAuthentication(socket, next) {
    console.log("Authenticate JWT", socket.handshake.address);
    console.log(socket);
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
