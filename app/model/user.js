const { promisify } = require('util');
var sql = require('../../sql/sql');

// node native promisify
const asyncQuery = promisify(sql.query).bind(sql);

var User = function (user) {
    this.color = user.color;
    this.fullName = user.fullName;
    this.icon = user.icon;
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.password = user.password;
    this.newPassword = user.newPassword;
    this.user = user.user;
};

User.getAll = async function () {
    const rows = asyncQuery(
        `SELECT SQL_NO_CACHE users.id, users.login, users.name, users.full_name,
        users_icon.icon, users_icon.color
        FROM users
        LEFT JOIN users_icon ON users.id = users_icon.id_user`,
    );

    return rows;
};

User.getBySeason = async function (season) {
    const rows = asyncQuery(
        `SELECT SQL_NO_CACHE users.id, users.login as email, users.name, users.full_name as fullName,
        users_icon.icon, users_icon.color,
        users_season.id AS seasonId
        FROM users
        INNER JOIN users_season ON users.id = users_season.id_user AND users_season.id_season = ?
        LEFT JOIN users_icon ON users.id = users_icon.id_user`,
        [season],
    );

    return rows;
};

User.getById = async function (id) {
    const rows = asyncQuery(
        `SELECT SQL_NO_CACHE users.id, users.login as email, users.name, users.full_name as fullName,
        users_icon.icon, users_icon.color
        FROM users
        LEFT JOIN users_icon ON users.id = users_icon.id_user
        WHERE users.id = ?`,
        [id],
    );

    return rows;
};

User.setIcons = async function (id, icon, color) {
    const rows = asyncQuery(
        `INSERT INTO users_icon (id_user, icon, color) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE icon = ?, color = ?`,
        [id, icon, color, icon, color],
    );

    return rows;
};

User.setOnCurrentSeason = async function (season, id) {
    const rows = asyncQuery(
        `INSERT INTO users_season (id_user, id_season) VALUES (?, ?)`,
        [id, season],
    );

    return rows;
};

User.login = async function (season, userData) {
    const rows = asyncQuery(
        `SELECT SQL_NO_CACHE users.id, users.login as email, users.name, users.full_name as fullName,
        users_icon.icon, users_icon.color
        FROM users
        INNER JOIN users_season ON users.id = users_season.id_user 
        AND users_season.id_season = ?
        LEFT JOIN users_icon ON users.id = users_icon.id_user
        WHERE users.login = ? 
        AND users.password = ?`,
        [season, userData.email, userData.password],
    );

    return rows;
};

User.updateInfo = async function (id, userData) {
    const { name, fullName, email } = userData;

    const rows = asyncQuery(
        `UPDATE users 
        SET name = ?,
        full_name = ?, 
        login = ?
        WHERE id = ?`,
        [name, fullName, email, id],
    );

    return rows;
};

User.updatePassword = async function (id, userData) {
    const { password, newPassword } = userData;

    const rows = asyncQuery(
        `UPDATE users 
        SET password = ?
        WHERE id = ?
        AND password = ?`,
        [newPassword, id, password]
    );

    return rows;
};

User.checkEmail = async function (email, loggedUserId) {
    const rows = asyncQuery(
        `SELECT SQL_NO_CACHE login FROM users WHERE login = ? AND id != ?`,
        [email, loggedUserId]
    );

    return rows;
};

User.checkName = async function (name, loggedUserId) {
    const rows = asyncQuery(
        `SELECT SQL_NO_CACHE name FROM users WHERE name = ? AND id != ?`,
        [name, loggedUserId]
    );

    return rows;
};

User.register = async function (userData) {
    const { email, password, fullName, name } = userData;

    const rows = asyncQuery(
        `INSERT INTO users (login, password, full_name, name) VALUES (?, ?, ?, ?)`,
        [email, password, fullName, name],
    );

    return rows;
};


module.exports = User;
