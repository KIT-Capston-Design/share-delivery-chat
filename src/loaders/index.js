import expressLoader from './express.js';
import socketioLoader from './socket.io.js';

export default async ({ expressApp, httpServer }) => {

  await expressLoader({ app: expressApp });
  console.log('Express Intialized');

  await socketioLoader({ httpServer });
  console.log('Socket.IO Intialized');

}