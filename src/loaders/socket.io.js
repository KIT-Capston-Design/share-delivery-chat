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
    getExistingChatData: async function (roomId) {
      // 기존 채팅 데이터 레디스로부터 가져와서 가공
      const existingMessageList = await redis.client.lRange(
        `activated-delivery-room:${roomId}:chat`,
        0,
        -1
      );

      const messageList = [];
      for (let idx = 0; idx < existingMessageList.length; idx++) {
        const message = JSON.parse(existingMessageList[idx]);
        message.chatId = idx;
        messageList.push(message);
      }

      return messageList;
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

    socket.on("message", async ({ text }, done) => {
      const message = new MessageModel(socket.decoded.accountId, text, Date.now());

      //레디스 리스트에 채팅 내용 저장 후 리스트의 길이 받는다.
      const listLength = await redis.client.rPush(
        `activated-delivery-room:${socket.currentRoomId}:chat`,
        JSON.stringify(message)
      );

      //리스트의 길이 - 1 == 삽입된 메시지의 idx(id)
      message.chatId = listLength - 1;

      //방 내 다른 사용자들에게 메시지 송신
      socket.to(socket.currentRoomId).emit("message", message);
      done(message.chatId);
    });

    async function enterRoomHandler({ payload: roomId }, done) {
      const room = await roomList.getRoom(parseInt(roomId));

      //해당하는 방이 존재하지 않을 경우 작업 종료
      if (room === null) {
        console.log(
          `Client ${socket.handshake.address} 방 입장 실패 :: 방을 찾을 수 없음. roomId : ${roomId}`
        );
        done({ isSuccess: false, roomId, message: `DeliveryRoom is not found` });
        return;
      }

      //참여 권한 체크 (api 서버에서 모집글에 참여 중인지)
      if (!roomList.amIParticipant(parseInt(roomId), socket.decoded.accountId)) {
        console.log(
          `Client ${socket.handshake.address} 방 입장 실패 :: 기존 모집글에 참여중이 유저가 아님. roomId : ${roomId}`
        );
        done({
          isSuccess: false,
          roomId,
          message: `You don't have permission to enter delivery chat room ${roomId}`,
        });
      }

      //방 입장
      socket.join(roomId);
      socket.currentRoomId = roomId;
      console.log(`Client ${socket.handshake.address} 방 입장 성공 `);

      // 기존 채팅 데이터 가져오기
      const messageList = await roomList.getExistingChatData(roomId);

      done({ isSuccess: true, roomId, message: "enter_room success", messageList });
    }
  }

  function jwtAuthentication(socket, next) {
    console.log("Socket.IO client auth start", socket.handshake.address);
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

class MessageModel {
  constructor(accountId, message, sendDateTime) {
    this.accountId = accountId;
    this.message = message;
    this.sendDateTime = sendDateTime;
  }
}
