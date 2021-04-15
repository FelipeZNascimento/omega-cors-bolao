var sql = require('../../sql/sql');

var Team = function (team) {
    this.id = team.id;
    this.name = team.name;
    this.alias = team.alias;
    this.conference = team.conference;
    this.division = team.division;
    this.code = team.code;
    this.team = team.team;
};

Team.getAll = function (result) {
    sql.query(
        `SELECT SQL_NO_CACHE * FROM teams`,
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

module.exports = Team;
