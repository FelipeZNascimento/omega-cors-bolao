var sql = require('../../sql/sql');
const { promisify } = require('util');
const asyncQuery = promisify(sql.query).bind(sql);

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

    if (teams.length > 0) {
        teams.forEach((team) => {
            if (team.conference.toLowerCase() === 'afc') {
                afc[team.division.toLowerCase()].push(team);
            }
            if (team.conference.toLowerCase() === 'nfc') {
                nfc[team.division.toLowerCase()].push(team);
            }
        });
    }

    return ({
        afc,
        nfc
    });
};

Team.getAll = async function () {
    const rows = asyncQuery(`SELECT SQL_NO_CACHE * FROM teams`);

    return rows;
};

module.exports = Team;
