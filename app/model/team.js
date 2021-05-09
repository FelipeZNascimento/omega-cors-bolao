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

Team.byConferenceAndDivision = (teams) => {
    const afc = {
        north: [],
        east: [],
        south: [],
        west: []
    };

    const nfc = {
        north: [],
        east: [],
        south: [],
        west: []
    };

    teams.forEach((team) => {
        if (team.conference.toLowerCase() === 'afc') {
            afc[team.division.toLowerCase()].push(team);
        }
        if (team.conference.toLowerCase() === 'nfc') {
            nfc[team.division.toLowerCase()].push(team);
        }
    });

    return ({
        afc,
        nfc
    });
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
