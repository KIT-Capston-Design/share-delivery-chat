
import {Server as SocketIO} from "socket.io"

export default async ( {httpServer} ) => {

  const socketioServer = new SocketIO(httpServer);
    
  socketioServer.on("connection", socket => {
      
      socket.on("enter_room", (msg, done) => {
          console.log(msg);
          setTimeout(() => {
              done();
          }, 5000);
      })

  });
}