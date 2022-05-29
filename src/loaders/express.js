import * as express from 'express';
import { createRequire } from "module";
import path from 'path';

const require = createRequire(import.meta.url);
const __dirname = path.resolve();

export default async ( {app} ) => {

  app.use(require('morgan')('dev'));
  app.use(express.json());

  app.set("view engine", "pug");
  app.set("views", __dirname + "/src/web/views");
  app.use("/public", express.static(__dirname + '/src/web/public'));


  app.get("/", (_, res) => res.render("home"));
  app.get("/*", (_, res) => res.redirect("/"));


  return app;
}