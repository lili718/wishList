let express = require("express");
//let request = require("request");
let app = express();
let mysql = require('mysql');

let con = mysql.createConnection({
    'host': 'localhost',
    'user': 'wishadmin',
    'password': 'lls375w!$h',
    'database': 'test2020'
});

con.connect(function(err) {
    if (err) {
        console.log("Error connecting to database\n" + err.message);
    }
    else {
        console.log("Database successfully connected");
    }
});

app.use(express.static("."));

app.listen(8080, function() {
    console.log("Server running.")
});