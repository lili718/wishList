let express = require("express");
//let request = require("request");
let app = express();
let mysql = require('mysql');
let session = require("client-sessions");
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

app.post("/auth", function(req, res) {
    let email = req.body.email;
    let pass = req.body.pass;
    if (email && pass) {
        login.login(con, email, pass, function(val) {
            if (val<=0) //if not successful
                res.redirect("./login.html");
            else //if successful
                res.redirect("./home.html");
        });
    }
    else {
        res.redirect("./login.html");
        res.end();
    }
});

app.use(express.static("."));

app.listen(8080, function() {
    console.log("Server running.")
});