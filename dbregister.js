function register(conn, first, last, user, email, pass) {
    const query = "INSERT INTO users VALUES (" + conn.escape(user) + ", " + email + ", SHA1('" + pass + "'), " +
        first + ", " + last + ";";
    conn.query(query, function(err, rows, fields) {
        if (err) {
            console.log("Error has occurred:\n", err);
        }
        else {
            console.log("Addition successful.")
        }
    })
}
exports.register = register;