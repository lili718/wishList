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
                            "<input type='text' name='user' placeholder='Username' style='text-align: center'>" +
                            "<input type='password' name='pass' placeholder='Password' style='text-align: center'>" +
                            "<center><input type='submit' value='Login'></center>" +

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
                    "<center><h3>Your wishLists:</h3></center>" +
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
                    let lQuery = "SELECT * FROM wishlist_items WHERE wishlist_number = '" + result[index].wishlist_num + "';";
                    con.query(lQuery, function(err, resu, fields){
                        mystr += "<table>"+"<tr><th>" + result[index].name_of_wishlist + "</th></tr>" + "<td>";
                        if (err) {
                            console.log("Error:", err);
                            mystr += "<p>There was an error in retrieving your list items.</p>";
                        }
                        if (resu.length <=0){
                            mystr += "<p>You currently have no items in this list.</p>";
                        }
                        else{
                            mystr += "<ul>";
                            for (let i=0; i<resu.length; i++) {
                                mystr += "<li><a href='" + resu[i].link + "'>"+ resu[i].name +
                                    "</a>" + ", $" + resu[i].price + "</li>";
                            }
                            mystr += "</ul>" + "</td>" + "</table>";
                        }
                        if (index === (result.length - 1)) {
                            mystr += "<button id='addbutton'><a href='/additem'>Add new item to a wishlist!</a></button>" + "</div>" + "</body>" + "</html>";
                            res.send(mystr);
                        }
                    });
                }
            }
        });
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
            "<center><div class='container'>" +
            "<form method='get' action='/addedlist'>" +
            "<h3>Creation of a New List</h3>" +
            "<input type='text' name='nameofNewList' placeholder='Name of New Item' style='text-align: center'>" +
            "<center><input id='newlistbutton' type='submit' value='Submit New List Creation'></center>" +
            "</form>";

        if (req.cookie.status) {
            mystr += "<p style='color: red'>" + req.cookie.status + "</p>" +
                "<p>Click here to return to the <a href='/home'>homepage</a>.</p>";
            delete req.cookie.status;
        }

        mystr += "</div></center>" +
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
            "<center><div class='container'>" +
            "<center><form method='get' action='/addeditem'>" +
            "<h3>Creation of a Item</h3>" +
            "<label for='wishlist'>Choose the wish list to add to:</label>" +
            "<select name='nameoflist' id='wishlist'>";
            let numQuery = "SELECT * FROM wishlists WHERE userID = '" + req.cookie.user +"';";
            con.query(numQuery, function(err, result, fields) {
                for(let index = 0; index < result.length; index++){
                    mystr += "<option value='" + result[index].name_of_wishlist + "'>" + result[index].name_of_wishlist + "</option>"
                }
                mystr +=
                    "<input type='text' name='nameofNewItem' placeholder='Name of New Item' style='text-align: center'>" +
                    "<input type='text' name='priceofNewItem' placeholder='Price of New Item' style='text-align: center'>" +
                    "<input type='url' name='linkofNewItem' placeholder='Link of New Item' style='text-align: center'>" +
                    "<center><input id='newitembutton' type='submit' value='Submit New item'></center>" +
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
    let listName = req.query.nameoflist;
    let name = req.query.nameofNewItem;
    let price = req.query.priceofNewItem;
    let link = req.query.linkofNewItem;
    let nQuery = "SELECT wishlist_num FROM wishlists WHERE userID = '" + req.cookie.user + "' AND name_of_wishlist = '" + listName + "';";
    con.query(nQuery, function(err, result, fields) {
        if (err) {
            console.log("Error has occurred:\n", err);
        }
        let list_num = result[0].wishlist_num;
        if (name && listName) {
            let query = "INSERT INTO wishlist_items (wishlist_number, name, price, link, picture) VALUES ('" + list_num + "', '" + name + "', '" + price + "', '" + link + "', 'pic');";
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

});

app.get("/logout", function(req, res) {
    req.cookie.reset();
    req.cookie.msg = "You have successfully logged out!";
    return res.redirect("./loginpage");
});

app.listen(8080, function() { //method to listen to server on port 8080
    console.log("Server running.")
});