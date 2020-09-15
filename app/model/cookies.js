var sql = require('../../sql/sql');

var Cookies = function (cookies) {
    this.cookies = cookies.cookies;
    this.id_user = cookie.id_user;
    this.cookie = cookies.cookie;
    this.timestamp = cookies.timestamp;
};

Cookies.update = function (id_user, cookie, result) {
    sql.query(
        `INSERT INTO cookies (id_user, cookie) VALUES (?, ?)`,
        [id_user, cookie],
        function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            }
            else {
                result(null, res);
            }
        });
};

Cookies.delete = function (id_user, cookie, result) {
    sql.query(
        `DELETE FROM cookies WHERE id_user = ? AND cookie = ?`,
        [id_user, cookie],
        function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            }
            else {
                result(null, res);
            }
        });
};

module.exports = Cookies;