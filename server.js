let express = require("express");
//let request = require("request");
let app = express();
let mysql = require('mysql');
const login = require("./login");
const bp = require("body-parser");
app.use(bp.urlencoded({extended:false}));
app.use(bp.json());

let con = mysql.createConnection({
    'host': 'localhost',
    'user': 'wishadmin',
    'password': 'lls375w!$h',
    'database': 'wishlist'
});

con.connect(function(err) {
    if (err) {
        console.log("Error connecting to database\n" + err.message);
    }
    else {
        console.log("Database successfully connected");
    }
});

app.post("./logincheck", function(req, res) {
    login.login(conn, req.body.email, req.body.pass, function(val) {
       if (val<=0)
           res.redirect("./login");
       else
           res.redirect("./home");
    });
});

app.use(express.static("."));

app.listen(8080, function() {
    console.log("Server running.")
});