import loaders from './loaders/index.js';
import express from 'express';

async function startServer() {

  const app = express();
  const port = process.env.PORT || 3000;

  await loaders({ expressApp: app });

  app.listen(port, err => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`Server app listening at http://localhost:${port}`);
  });
}

startServer();