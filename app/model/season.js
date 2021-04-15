var sql = require('../../sql/sql');

var Season = function (season) {
    this.season = season.season;
    this.id = season.id;
    this.description = season.description;
};

Season.getInfo = function (season, result) {
    sql.query(
        `SELECT SQL_NO_CACHE seasons.id, seasons.description FROM seasons
        WHERE seasons.id = ?`,
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

module.exports = Season;