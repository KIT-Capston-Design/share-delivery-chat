import loaders from './loaders/index.js';
import express from 'express';
import http from "http"

const PORT = process.env.PORT || 3000;

async function startServer() {

  const app = express();
  const httpServer = http.createServer(app);

  await loaders({ expressApp: app, httpServer});

  httpServer.listen(PORT, err => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`Server app listening at http://localhost:${PORT}`);
  });
}

startServer();