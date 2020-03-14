function login(conn, user, pass, next) {
    const query = "SELECT email FROM users WHERE email = " + conn.escape(user) +
        "AND password = SHA1('" + pass + "')";
    conn.query(query, function(err, rows, fields) {
       if (err)
           next(-1);
       else
           next(rows.length);
    });
}

exports.login = login;