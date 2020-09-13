var sql = require('../../sql/sql');

//Task object constructor
var User = function (user) {
    this.user = user.user;
    this.id = user.id;
    this.login = user.login;
    this.password = user.password;
    this.full_name = user.full_name;
    this.status = user.status;
    this.icon = user.icon;
    this.color = user.color;    
};

User.getAll = function (result) {
    sql.query(
        `SELECT SQL_NO_CACHE users.id, users.login, users.name, users.full_name,
        users_icon.icon, users_icon.color
        FROM users
        LEFT JOIN users_icon ON users.id = users_icon.id_user`,
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

User.getById = function (id, result) {
    sql.query(
        `SELECT SQL_NO_CACHE users.id, users.login, users.name, users.full_name,
        users_icon.icon, users_icon.color
        FROM users
        LEFT JOIN users_icon ON users.id = users_icon.id_user
        WHERE users.id = ?`,
        [id],
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

module.exports = User;
