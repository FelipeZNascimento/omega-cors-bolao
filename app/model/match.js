var sql = require('../../sql/sql');

var Match = function (match) {
    this.match = match.match;
    this.id = match.id;
    this.id_season = match.id_season;
    this.week = match.week;
    this.timestamp = match.timestamp;
    this.away_team_code = match.away_team_code;
    this.id_away_team = match.id_away_team;
    this.away_points = match.away_points;
    this.home_points = match.home_points;
    this.id_home_team = match.id_home_team;
    this.home_team_code = match.home_team_code;
    this.status = match.status;
    this.possession = match.possession;
};

const now = new Date();

Match.getBySeason = function (season, result) {
    sql.query(
        `SELECT SQL_NO_CACHE matches.id, matches.timestamp, matches.week, matches.away_points, matches.home_points, matches.status, matches.possession, 
        teamsHome.name AS team_home, teamsHome.alias AS team_home_alias, teamsHome.id AS id_team_home, teamsHome.code AS team_home_code, 
        teamsAway.name AS team_away, teamsAway.alias AS team_away_alias, teamsAway.id AS id_team_away, teamsAway.code AS team_away_code
        FROM matches
        INNER JOIN teams as teamsHome 		ON matches.id_home_team=teamsHome.id
        INNER JOIN teams as teamsAway 		ON matches.id_away_team=teamsAway.id
        WHERE matches.id_season = ?
        ORDER BY matches.timestamp ASC`,
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

Match.getByWeek = function (week, result) {
    sql.query(
        `SELECT SQL_NO_CACHE matches.id, matches.timestamp, matches.week, matches.away_points, matches.home_points, matches.status, matches.possession, 
        teamsHome.name AS team_home, teamsHome.alias AS team_home_alias, teamsHome.id AS id_team_home, teamsHome.code AS team_home_code, 
        teamsAway.name AS team_away, teamsAway.alias AS team_away_alias, teamsAway.id AS id_team_away, teamsAway.code AS team_away_code
        FROM matches
        INNER JOIN teams as teamsHome 		ON matches.id_home_team=teamsHome.id
        INNER JOIN teams as teamsAway 		ON matches.id_away_team=teamsAway.id
        WHERE matches.week = ?
        ORDER BY matches.timestamp ASC`,
        [week],
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

Match.getBySeasonAndWeek = function (season, week, result) {
    sql.query(
        `SELECT SQL_NO_CACHE matches.id, matches.timestamp, matches.week, matches.status, matches.possession,
        matches.away_points as awayScore, matches.home_points as homeScore,
        teamHome.name AS teamHome, teamHome.alias AS teamHomeAlias, teamHome.id AS idTeamHome, 
        teamHome.code AS teamHomeCode, teamHome.background AS teamHomeBackground, teamHome.foreground AS teamHomeForeground, 
        teamAway.name AS teamAway, teamAway.alias AS teamAwayAlias, teamAway.id AS idTeamAway,
        teamAway.code AS teamAwayCode, teamAway.background AS teamAwayBackground, teamAway.foreground AS teamAwayForeground
        FROM matches
        INNER JOIN teams as teamHome 		ON matches.id_home_team = teamHome.id
        INNER JOIN teams as teamAway 		ON matches.id_away_team = teamAway.id
        WHERE matches.id_season = ?
        AND matches.week = ?
        ORDER BY matches.timestamp ASC`,
        [season, week],
        function (err, res) {
            if (err) {
                console.log(`error: ${err}`);
                result(err, null);
            } else {
                result(null, res);
            }
        });
};

Match.updateFromMatchInfo = function (matchData, season, result) {
    sql.query(
        `UPDATE matches
        SET away_points = ?,
        home_points = ?,
        status = ?,
        possession = ?
        WHERE id_away_team = (
            SELECT id 
            FROM teams
            WHERE code = ?
        )
        AND id_home_team = (
            SELECT id 
            FROM teams
            WHERE code = ?
        )
        AND week <= 17
        AND id_season = ?`,
        [
            matchData.away_points,
            matchData.home_points,
            matchData.status,
            matchData.possession,
            matchData.away_team_code,
            matchData.home_team_code,
            season
        ],
        function (err, res) {
            if (err) {
                console.log(`error: ${err}`);
                result(err, null);
            } else {
                result(null, res);
            }
        }
    )
};

module.exports = Match;
