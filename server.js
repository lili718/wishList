let express = require("express");
let request = require("request");
let app = express();

app.use(express.static("."));

app.listen(8080);