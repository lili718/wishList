function login(conn, user, pass, next) {
    const query = "SELECT username FROM users WHERE username = " + conn.escape(user) +
        "AND password = SHA1('" + pass + "')";
    conn.query(query, function(err, rows, fields) {
       if (err)
           next(-1);
       else
           next(rows.length);
    });
}

exports.login = login;