var sql = require('../../sql/sql');

var User = function (user) {
    this.color = user.color;
    this.cookies = user.cookies;
    this.fullName = user.fullName;
    this.icon = user.icon;
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.password = user.password;
    this.user = user.user;
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

User.getBySeason = function (season, result) {
    sql.query(
        `SELECT SQL_NO_CACHE users.id, users.login as email, users.name, users.full_name as fullName,
        users_icon.icon, users_icon.color,
        users_season.id AS seasonId
        FROM users
        INNER JOIN users_season ON users.id = users_season.id_user AND users_season.id_season = ?
        LEFT JOIN users_icon ON users.id = users_icon.id_user`,
        [season],
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
        }
    );
};
  
function setIcons(id, icon, color) {
    sql.query(
        `INSERT INTO users_icon (id_user, icon, color) VALUES (?, ?, ?)`,
        [id, icon, color],
        function (err, res) {
            if (err) {
                console.log("error: ", err);
                return false;
            }
            else {
                console.log(res);
                return true;
            }
        }
    );
};

function setOnCurrentSeason(season, id) {
    sql.query(
        `INSERT INTO users_season (id_user, id_season) VALUES (?, ?)`,
        [id, season],
        function (err, res) {
            if (err) {
                console.log("error: ", err);
                return false;
            }
            else {
                return true;
            }
        }
    );
};

User.register = async function (season, userData, result) {
    sql.query(
        `INSERT INTO users (login, password, name) VALUES (?, ?, ?)`,
        [userData.login, userData.password, userData.name],
        function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            }
            else {
                setOnCurrentSeason(season, res.insertId);
                setIcons(res.insertId, userData.icon, userData.color);
                result(null, res);
            }
        }
    );
};

User.login = function (season, userData, result) {
    sql.query(
        `SELECT SQL_NO_CACHE users.id, users.login as email, users.name, users.full_name as fullName,
        users_icon.icon, users_icon.color
        FROM users
        INNER JOIN users_season ON users.id = users_season.id_user 
        AND users_season.id_season = ?
        LEFT JOIN users_icon ON users.id = users_icon.id_user
        WHERE users.login = ? 
        AND users.password = ?`,
        [season, userData.email, userData.password],
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

User.loginCookies = function (season, userData, result) {
    sql.query(
        `SELECT SQL_NO_CACHE users.id, users.login, users.name, users.full_name,
        users_icon.icon, users_icon.color
        FROM cookies
        INNER JOIN users ON users.id=cookies.id_user 
        AND cookies.id_user = ?
        INNER JOIN users_season ON users.id = users_season.id_user 
        AND users_season.id_season = ?
        LEFT JOIN users_icon ON users.id = users_icon.id_user
        WHERE cookies.cookie = ?`,
        [userData.id, season, userData.cookies],
        function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            }
            else {
                if (res.length === 0) {
                    result('User not found', null);
                } else {
                    result(null, res);
                }
            }
        });
};

User.checkEmail = function (email, result) {
    sql.query(
        `SELECT SQL_NO_CACHE login FROM users WHERE login = ?`,
        [email],
        function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            }
            else {
                result(null, res);
            }
        }
    );
};

User.checkName = function (name, result) {
    sql.query(
        `SELECT SQL_NO_CACHE name FROM users WHERE name = ?`,
        [name],
        function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            }
            else {
                result(null, res);
            }
        }
    );
};

module.exports = User;
