let express = require("express"); //requires all necessary modules
let mysql = require('mysql');
let session = require("client-sessions");
const login = require("./login");
const dbregister = require("./dbregister");
const bp = require("body-parser");
let sessiondata = require("./sessions");
let app = express();
let con = mysql.createConnection({ //begins connection to mySQL server
    'host': 'localhost',
    'user': 'wishadmin',
    'password': 'lls375w!$h',
    'database': 'wishlist'
});
let randomStr = sessiondata.randomString;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bp.urlencoded({extended:false})); //needed from body-parser to parse POST data
app.use(bp.json());

app.use(express.static(".")); //allows static files to be served from current directory

app.use(session({
    cookieName: 'cookie',
    secret: randomStr,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

con.connect(function(err) { //creates a connection to mySQL server
    if (err) {
        console.log("Error connecting to database.\n" + err.message);
    }
    else {
        console.log("Database successfully connected.");
    }
});


app.get("/loginpage", function(req, res) {
   let mystr = "<html lang='en'>" +
       "<head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'>" +
       "<title>wishList Login</title><link rel='stylesheet' href='styles.css'>" +
       "</head>" +
       "<body>" +
       "<div id='navBar'>" +
                "<span id='title'><a href='index.html'>wishList</a></span>" +
                "<span><a href='aboutus.html'>about us</a></span>" +
                "<span><a href='contactus.html'>contact us</a></span>" +
                "<span><a href='signup.html'>sign up</a> </span>" +
            "</div>" +
            "<div class='login-form'>" +
                "<h1>Login Form</h1>";

        if(req.cookie.msg) {
            mystr += "<p style='color: red'>" + req.cookie.msg + "</p>";
            delete req.cookie.msg;
        }

        mystr += "<form method='POST' action='./auth'>" +
                        "<label for='userName'>Username:</label>" +
                        "<input type='text' name='user'>" +
                        "<label for='password'>Password:</label>" +
                        "<input type='password' name='pass'>" +
                        "<input type='submit' value='Login'>" +
                    "</form>" +
            "</div>" +
       "</body>" +
       "</html>";
   res.send(mystr);
});

app.post("/register", function(req, res) {
    console.log(req.body);
    /*
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let username = req.body.userName;
    let email = req.body.userEmail;
    let pass = req.body.userPassword;
    if (firstName && lastName && username && email && pass) {
        dbregister.register(con, firstName, lastName, username, email, pass);
    }
    else {
        console.log("Addition into database not successful.")
    }*/
    res.send("Request received!");
});

app.post("/auth", function(req, res) { //authorizes login from user
    let user = req.body.user; //change for username
    let pass = req.body.pass;
    if (user && pass) {
        login.login(con, user, pass, function(val) {
            if (val<=0) {
                req.cookie.msg = "Invalid login."
                res.redirect("/loginpage");
            }
            else {
                req.cookie.user = user;
                res.redirect("/home");
            }
        });
    }
    else {
        res.redirect("./login.html");
        res.end();
    }
});

app.get("/home", function(req, res) {
    if(!req.cookie.user) {
        req.cookie.msg = "Please login.";
        return res.redirect("/loginpage");
    }
    else {
        let mystr = "<!DOCTYPE html>" +
            "<html lang='en'>" +
                "<head>" +
                    "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
                    "<title>wishList</title>" +
                    "<link rel='stylesheet' href='styles.css'>" +
                    "<script type='text/javascript' src='wishlist.js'></script>" +
                "</head>" +
                "<body>" +
                    "<div id='navBar'>" +
                        "<span id='title'><a href='index.html'>wishList</a></span>" +
                        "<span><a href='./aboutus.html'>about us</a></span>" +
                        "<span><a href='./contactus.html'>contact us</a></span>" +
                        "<span><a href='./settings.html'>settings</a></span>" +
                        "<span><a href='logout'>logout</a></span>" +
                    "</div>" +
                    "<center>" +
                    "<h3 id='header'>Welcome " + req.cookie.user+ "!</h3>" +
                    "<img src='https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ4S71dwKwLP6LUciL0KOzTIqGDVIaympgl-_r_oRrz5K02aavq' alt='User Photo'>" +
                    "<P><button>New wishList!</button></P>" +
                    "</center>" +
                    "<h3>Your wishLists:</h3>" +
                    "<div class='container'>" +
                        "<table><tr><th><h2>wishList 1</h2></th></tr>" +
                            "<td>" +
            "                <ul>" +
                                "<li>item 1</li>" +
                                "<li>item 2</li>" +
                                "<li>item 3</li>" +
                            "</ul>" +
                            "</td></table>" +
                        "<table><tr><th><h2>wishList 2</h2></th></tr>" +
                        "<td>" +
                        "<ul>" +
                            "<li>item 1</li>" +
                            "<li>item 2</li>" +
                            "<li>item 3</li>" +
                        "</ul>" +
                        "</td></table>" +
                        "<table><tr><th><h2>wishList 3</h2></th></tr>" +
                        "<td>" +
                        "<ul>" +
                                "<li>item 1</li>" +
                                "<li>item 2</li>" +
                                "<li>item 3</li>" +
                        "</ul>" +
                        "</td></table>" +
                    "</div>" +
                "</body>" +
            "</html>";
        res.send(mystr);
    }
});

app.get("/logout", function(req, res) {
    req.cookie.reset();
    req.cookie.msg = "You have successfully logged out!";
    return res.redirect("./loginpage")
})

app.listen(8080, function() { //method to listen to server on port 8080
    console.log("Server running.")
});