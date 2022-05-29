
import {Server as SocketIO} from "socket.io"

export default async ( {httpServer} ) => {

  const socketioServer = new SocketIO(httpServer);
    
  socketioServer.on("connection", socket => {
      
      socket.onAny((event)=> console.log("Socket.IO event received :", event))
      
      socket.on("enter_room", (roomId, done) => {

          console.log(roomId);

          setTimeout(() => {
              done();
          }, 1000);

      })

  });
}