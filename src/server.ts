import * as express from "express";

import { createBasicApp } from "./app";
import config from "./config";

const app = createBasicApp();

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(config.PORT, () => {
  console.log(`Listening on port ${config.PORT}...`);
});
