import * as express from 'express';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

export default async ( {app} ) => {

  app.get('/', (req, res) => { res.status(200).end(); });

  app.use(require('morgan')('dev'));
  app.use(express.json());

  return app;
}