import { Server as SocketIO } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import redis from "./redis.js";
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
    socket.onAny((event) => console.log("Socket.IO event received :", event));
    socket.on("enter_room", enterRoomHandler);

    async function enterRoomHandler({ payload: roomId }, done) {
      roomId = parseInt(roomId);

      const room = await roomList.getRoom(roomId);

      //해당하는 방이 존재하지 않을 경우 작업 종료
      if (room === null) {
        done(`DeliveryRoom ${roomId} is not found`);
        return;
      }

      //참여 권한 체크 (기존 모집글에 참여 중인지)

      roomList.amIParticipant(roomId, socket.decoded.accountId);

      done("success");
    }
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
