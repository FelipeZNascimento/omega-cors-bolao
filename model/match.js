const { promisify } = require("util");
var sql = require("../sql/sql");

// node native promisify
const asyncQuery = promisify(sql.query).bind(sql);
const MATCH_STATUS = require("../const/matchStatus");

var Match = function (match) {
  this.match = match.match;
  this.id = match.id;
  this.idSeason = match.idSeason;
  this.week = parseInt(match.week);
  this.timestamp = match.timestamp;
  this.awayTeamCode = match.awayTeamCode;
  this.idAwayTeam = match.idAwayTeam;
  this.awayPoints = parseInt(match.awayPoints);
  this.homePoints = parseInt(match.homePoints);
  this.idHomeTeam = match.idHomeTeam;
  this.homeTeamCode = match.homeTeamCode;
  this.status = parseInt(match.status);
  this.possession = match.possession;
  this.overUnder = match.overUnder;
  this.homeTeamOdds = match.homeTeamOdds;
  this.clock = match.clock;
};

Match.getById = async function (season) {
  const rows = asyncQuery(
    `SELECT SQL_NO_CACHE matches.id, matches.timestamp, matches.week, matches.id_season as season, matches.status, matches.possession,
        matches.away_points as awayScore, matches.home_points as homeScore,
        teamHome.name AS teamHome, teamHome.alias AS teamHomeAlias, teamHome.id AS idTeamHome, 
        teamHome.code AS teamHomeCode, teamHome.background AS teamHomeBackground, teamHome.foreground AS teamHomeForeground, 
        teamAway.name AS teamAway, teamAway.alias AS teamAwayAlias, teamAway.id AS idTeamAway,
        teamAway.code AS teamAwayCode, teamAway.background AS teamAwayBackground, teamAway.foreground AS teamAwayForeground
        FROM matches
        INNER JOIN teams as teamHome 		ON matches.id_home_team = teamHome.id
        INNER JOIN teams as teamAway 		ON matches.id_away_team = teamAway.id
        WHERE matches.id = ?`,
    [season]
  );

  return rows;
};

Match.getBySeason = async function (season) {
  const rows = asyncQuery(
    `SELECT SQL_NO_CACHE matches.id, matches.timestamp, matches.week, matches.id_season as season, matches.status, matches.possession,
        matches.away_points as awayScore, matches.home_points as homeScore, matches.clock, matches.overUnder, matches.homeTeamOdds,
        teamHome.name AS teamHome, teamHome.alias AS teamHomeAlias, teamHome.id AS idTeamHome, 
        teamHome.code AS teamHomeCode, teamHome.background AS teamHomeBackground, teamHome.foreground AS teamHomeForeground, 
        teamAway.name AS teamAway, teamAway.alias AS teamAwayAlias, teamAway.id AS idTeamAway,
        teamAway.code AS teamAwayCode, teamAway.background AS teamAwayBackground, teamAway.foreground AS teamAwayForeground
        FROM matches
        INNER JOIN teams as teamHome 		ON matches.id_home_team = teamHome.id
        INNER JOIN teams as teamAway 		ON matches.id_away_team = teamAway.id
        WHERE matches.id_season = ?
        ORDER BY matches.timestamp ASC`,
    [season]
  );

  return rows;
};

Match.getByWeek = async function (week) {
  const rows = asyncQuery(
    `SELECT SQL_NO_CACHE matches.id, matches.timestamp, matches.week, matches.away_points, matches.home_points, matches.status, matches.possession, 
        teamsHome.name AS team_home, teamsHome.alias AS team_home_alias, teamsHome.id AS id_team_home, teamsHome.code AS team_home_code, 
        teamsAway.name AS team_away, teamsAway.alias AS team_away_alias, teamsAway.id AS id_team_away, teamsAway.code AS team_away_code
        FROM matches
        INNER JOIN teams as teamsHome 		ON matches.id_home_team=teamsHome.id
        INNER JOIN teams as teamsAway 		ON matches.id_away_team=teamsAway.id
        WHERE matches.week = ?
        ORDER BY matches.timestamp ASC`,
    [week]
  );

  return rows;
};

Match.getBySeasonAndWeek = async function (season, week) {
  const rows = asyncQuery(
    `SELECT SQL_NO_CACHE matches.id, matches.timestamp, matches.week, matches.id_season as season, matches.status, matches.possession,
        matches.away_points as awayScore, matches.home_points as homeScore, matches.clock, matches.overUnder, matches.homeTeamOdds, matches.clock,
        teamHome.id AS idTeamHome, teamAway.id AS idTeamAway
        FROM matches
        INNER JOIN teams as teamHome 		ON matches.id_home_team = teamHome.id
        INNER JOIN teams as teamAway 		ON matches.id_away_team = teamAway.id
        WHERE matches.id_season = ?
        AND matches.week = ?
        ORDER BY matches.timestamp, teamHome.code ASC`,
    [season, week]
  );

  return rows;
};

Match.updateFromMatchInfo = async function (matchData, season) {
  const rows = asyncQuery(
    `UPDATE matches
        SET away_points = ?,
        home_points = ?,
        status = ?,
        possession = ?,
        clock = ?
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
        AND week = ?
        AND id_season = ?`,
    [
      matchData.awayPoints,
      matchData.homePoints,
      matchData.status,
      matchData.possession,
      matchData.clock,
      matchData.awayTeamCode,
      matchData.homeTeamCode,
      matchData.week,
      season,
    ]
  );

  return rows;
};

Match.updateOddsMatchInfo = async function (matchData, season) {
  const rows = asyncQuery(
    `UPDATE matches
        SET overUnder = ?,
        homeTeamOdds = ?
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
        AND week = ?
        AND id_season = ?
        AND status = ?`,
    [
      matchData.overUnder,
      matchData.homeTeamOdds,
      matchData.awayTeamCode,
      matchData.homeTeamCode,
      matchData.week,
      season,
      MATCH_STATUS.NOT_STARTED,
    ]
  );

  return rows;
};

Match.getNextMatchWeek = async function () {
  const rows = asyncQuery(
    `SELECT week
        FROM matches
        WHERE matches.timestamp > UNIX_TIMESTAMP() - 24 * 3600
        ORDER BY timestamp ASC
        LIMIT 1`
  );

  return rows;
};

module.exports = Match;
