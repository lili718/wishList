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
            "<center>" +
                "<div class='container'>" +
                    "<div class='login-form'>" +
                        "<h1>Login Form</h1>";

        if(req.cookie.msg) {
            mystr += "<p style='color: red'>" + req.cookie.msg + "</p>";
            delete req.cookie.msg;
        }

            mystr += "<form class='center' method='POST' action='./auth'>" +
                            "<input type='text' name='user' placeholder='Username'>" +
                            "<input id='loginpass' type='password' name='pass' placeholder='Password'>" +
                            "<input type='submit' value='Login'>" +
                        "</form>" +
                    "</div>" +
                "</div>" +
            "</center>" +
       "</body>" +
       "</html>";
   res.send(mystr);
});

app.post("/register", function(req, res) {
    console.log(req.body);
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let username = req.body.userName;
    let email = req.body.userEmail;
    let pass = req.body.userPassword;
    if (firstName && lastName && username && email && pass) {
        dbregister.register(con, firstName, lastName, username, email, pass);
        console.log("Addition made");
    }
    else {
        console.log("Addition into database not successful.")
    }
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
        res.redirect("/loginpage");
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
                        "<span><a href='/logout'>logout</a></span>" +
                    "</div>" +
                    "<center>" +
                    "<h3 id='header'>Welcome " + req.cookie.user+ "!</h3>" +
                    "<img id='userPhoto' src='https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ4S71dwKwLP6LUciL0KOzTIqGDVIaympgl-_r_oRrz5K02aavq' alt='User Photo'>" +
                    "<p><button><a href='/addlist'>New wishList!</a></button></p>" +
                    "</center>" +
                    "<h3>Your wishLists:</h3>" +
                    "<div class='container'>";

        let numQuery = "SELECT * FROM wishlists WHERE userID = '" + req.cookie.user +"';";
        con.query(numQuery, function(err, result, fields) {
            if (err) {
                console.log("Error:", err);
                mystr += "<h3>There was an error in retrieving your lists.</h3>"
                mystr += "</div>" +
                    "</body>" +
                    "</html>";
                res.send(mystr);
            }
            if (result.length <= 0) {
                mystr += "<h3>You currently have no wishlists created!</h3>" +
                    "</div>" +
                    "</body>" +
                    "</html>";
                res.send(mystr);
            }
            else {
                for (let index = 0; index < result.length; index++) {
                    mystr += "<table>"+"<tr><th>" + result[index].name_of_wishlist + "</th></tr>" + "<td>" + "<ul>";
                        let lQuery = "SELECT * FROM wishlist_items WHERE wishlist_number = '" + result[index].wishlist_num + "';";
                        con.query(lQuery, function(err, resu, fields){
                            if (err) {
                                console.log("Error:", err);
                                mystr += "<p>There was an error in retrieving your list items.</p>";
                                //res.send(mystr);
                            }
                            if (resu.length <=0){
                                mystr += "<p>You currently have no items in this list.</p>";
                                console.log(resu.length)
                                //res.send(mystr);
                            }
                            else{
                                for (let i=0; i<resu.length; i++){
                                    mystr += "<li><a href='" + resu[i].link + "'>"+ resu[i].name +
                                        "</a></li>";
                                    //res.send(mystr);
                                }
                            }
                        });
                    mystr += "</ul>" + "</td>" + "</table>";
                }
                mystr += "<p><button><a href='/additem'>Add new item to a wishlist!</a></button></p>" + "</div>" + "</body>" + "</html>";
                res.send(mystr);
            }
        });
        /*
                        "<table><tr><th><h2>wishList 1</h2></th></tr>" +
                            "<td>" +
                            "<ul>" +
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
                        */
    }
});

app.get("/addlist", function(req, res) {
    if(!req.cookie.user) {
        req.cookie.msg = "Please login.";
        return res.redirect("/loginpage");
    }
    else {
        let mystr = "       <!DOCTYPE html>\n" +
            "    <html lang='en'>\n" +
            "        <head>\n" +
            "        <meta name='viewport' content='width=device-width, initial-scale=1'>\n" +
            "        <title>wishList Homepage</title>\n" +
            "    <link rel='stylesheet' href='styles.css'>\n" +
            "    </head>\n" +
            "    <body>\n" +
            "    <div id='navBar'>\n" +
            "        <span id='title'><a href='/home'>wishList</a></span>\n" +
            "        <span><a href='aboutus.html'>about us</a></span>\n" +
            "    <span><a href='contactus.html'>contact us</a></span>\n" +
            "    </div>\n" +
            "<div class='container'>" +
            "<form method='get' action='/addedlist'>" +
            "<h3>Creation of a New List</h3>" +
            "<label for='nameofNewList'>Name of New List:</label>" +
            "<input type='text' name='nameofNewList'>" +
            "<input id='newlistbutton' type='submit' value='Submit New List Creation'>" +
            "</form>";

        if (req.cookie.status) {
            mystr += "<p style='color: red'>" + req.cookie.status + "</p>" +
                "<p>Click here to return to the <a href='/home'>homepage</a>.</p>";
            delete req.cookie.status;
        }

        mystr += "</div>" +
            "    </body>\n" +
            "    </html>";
        res.send(mystr);
    }
});

app.get("/addedlist", function(req, res) {
    let name = req.query.nameofNewList;
    if (name) {
        let query = "INSERT INTO wishlists (userID, name_of_wishlist) VALUES ('" + req.cookie.user + "', '" + name + "')";
        con.query(query, function(err, rows, fields) {
            if (err) {
                console.log("Error has occurred:\n", err);
            }
            else {
                console.log("Addition successful.");
            }
        });
        req.cookie.status = "List added! Return to homepage to see list.";
        res.redirect("/addlist");
    }
    else {
        req.cookie.status = "Error with adding list. Try again.";
        res.redirect("/addlist");
    }
});

app.get("/additem", function(req, res){
    if(!req.cookie.user) {
        req.cookie.msg = "Please login.";
        return res.redirect("/loginpage");
    }
    else{
        let mystr = "       <!DOCTYPE html>\n" +
            "    <html lang='en'>\n" +
            "        <head>\n" +
            "        <meta name='viewport' content='width=device-width, initial-scale=1'>\n" +
            "        <title>wishList Homepage</title>\n" +
            "    <link rel='stylesheet' href='styles.css'>\n" +
            "    </head>\n" +
            "    <body>\n" +
            "    <div id='navBar'>\n" +
            "        <span id='title'><a href='/home'>wishList</a></span>\n" +
            "        <span><a href='aboutus.html'>about us</a></span>\n" +
            "    <span><a href='contactus.html'>contact us</a></span>\n" +
            "    </div>\n" +
            "<div class='container'>" +
            "<form method='get' action='/addeditem'>" +
            "<h3>Creation of a Item</h3>" +
            "<label for='wishlist'>Choose the wish list to add to:</label>" +
            "<select id='wishlist'>";
            let numQuery = "SELECT * FROM wishlists WHERE userID = '" + req.cookie.user +"';";
            con.query(numQuery, function(err, result, fields) {
                for(let index = 0; index < result.length; index++){
                    mystr += "<option value='" + result[index].name_of_wishlist + "'>" + result[index].name_of_wishlist + "</option>"
                    console.log(result[index].name_of_wishlist);
                }
                mystr += "</select>"+"<label for='nameofNewItem'>Name of New Item:</label>" +
                    "<input type='text' name='nameofNewItem'>" +
                    "<label for='priceofNewItem'>Price of New Item:</label>" +
                    "<input type='float' price='priceofNewItem'>" +
                    "<label for='linkofNewItem'>link of New Item:</label>" +
                    "<input type='text' name='linkofNewItem'>" +
                    "<input id='newitembutton' type='submit' value='Submit New item'>" +
                    "</form>";
                if (req.cookie.status) {
                    mystr += "<p style='color: red'>" + req.cookie.status + "</p>" +
                        "<p>Click here to return to the <a href='/home'>homepage</a>.</p>";
                    delete req.cookie.status;
                }
                mystr += "</div>" +
                    "    </body>\n" +
                    "    </html>";
                res.send(mystr);
             });
    }
});

app.get("/addeditem", function(req, res) {
    let name = req.query.nameofNewItem;
    let price = req.query.priceofNewItem;
    let link = req.query.linkofNewItem;
    //get wishlist number !!!!
    if (name) {
        let query = "INSERT INTO wishlist_items (name, price, link) VALUES ('" + name + "','" + price + "','" + link + "');"
        con.query(query, function(err, rows, fields) {
            if (err) {
                console.log("Error has occurred:\n", err);
            }
            else {
                console.log("Addition successful.");
            }
        });
        req.cookie.status = "List item added! Return to homepage to see list.";
        res.redirect("/additem");
    }
    else {
        req.cookie.status = "Error with adding item. Try again.";
        res.redirect("/additem");
    }
});

app.get("/logout", function(req, res) {
    req.cookie.reset();
    req.cookie.msg = "You have successfully logged out!";
    return res.redirect("./loginpage");
});

app.listen(8080, function() { //method to listen to server on port 8080
    console.log("Server running.")
});