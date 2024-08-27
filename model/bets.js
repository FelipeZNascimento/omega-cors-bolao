const { promisify } = require("util");
var sql = require("../sql/sql");

// node native promisify
const asyncQuery = promisify(sql.query).bind(sql);
const MATCH_STATUS = require("../const/matchStatus");

var Bets = function (bet) {
  this.bet = bet.bet;
  this.userId = bet.userId;
  this.matchId = bet.matchId;
  this.betValue = bet.betValue;
};

Bets.byMatchIds = async function (matchIds) {
  if (matchIds.length === 0) {
    return null;
  }

  const rows = asyncQuery(
    `SELECT bets.id, bets.id_bet as betValue, bets.id_user as userId, bets.id_match as matchId,
        users.name as userName, users_icon.icon as userIcon, users_icon.color as userColor
        FROM bets
        INNER JOIN matches 		ON matches.id = bets.id_match
        INNER JOIN users 		ON users.id = bets.id_user
        LEFT JOIN users_icon    ON users.id = users_icon.id_user
        WHERE matches.timestamp <= UNIX_TIMESTAMP()
        AND bets.id_match IN (?)
        GROUP BY bets.id_match, bets.id_user`,
    [matchIds]
  );
  return rows;
};

Bets.byUserId = async function (userId, seasonId) {
  const rows = asyncQuery(
    `SELECT SQL_NO_CACHE matches.id as matchId, matches.timestamp, matches.week, matches.id_season as season, matches.status, matches.possession,
        matches.away_points as awayScore, matches.home_points as homeScore, matches.overUnder, matches.homeTeamOdds,
        teamHome.name AS teamHome, teamHome.alias AS teamHomeAlias, teamHome.id AS idTeamHome, 
        teamHome.code AS teamHomeCode, teamHome.background AS teamHomeBackground, teamHome.foreground AS teamHomeForeground, 
        teamAway.name AS teamAway, teamAway.alias AS teamAwayAlias, teamAway.id AS idTeamAway,
        teamAway.code AS teamAwayCode, teamAway.background AS teamAwayBackground, teamAway.foreground AS teamAwayForeground,
        bets.id as betId, bets.id_match, bets.id_bet as betValue, bets.id_user as userId,
        users_icon.icon as userIcon, users_icon.color as userColor,
        users.name as userName, users.status as userStatus
        FROM matches
        INNER JOIN teams as teamHome 		ON matches.id_home_team = teamHome.id
        INNER JOIN teams as teamAway 		ON matches.id_away_team = teamAway.id
        LEFT JOIN bets                      ON matches.id = bets.id_match AND bets.id_user = ?
        LEFT JOIN users 		            ON users.id = ?
        LEFT JOIN users_icon                ON users_icon.id_user = ?
        WHERE matches.timestamp <= UNIX_TIMESTAMP()
        AND matches.id_season = ?
        AND matches.status NOT IN (?)
        GROUP BY bets.id_match, userId
        ORDER BY matches.week ASC`,
    [
      userId,
      userId,
      userId,
      seasonId,
      [MATCH_STATUS.NOT_STARTED, MATCH_STATUS.CANCELLED, MATCH_STATUS.DELAYED],
    ]
  );

  return rows;
};

Bets.byUserIdAndMatchIds = function (userId, matchIds, result) {
  if (matchIds.length === 0) {
    return result(null, []);
  } else {
    sql.query(
      `SELECT bets.id, bets.id_bet as betValue, bets.id_user as userId, bets.id_match as matchId,
        users.name as userName, users_icon.icon as userIcon, users_icon.color as userColor
        FROM bets
        INNER JOIN matches 		ON matches.id = bets.id_match
        INNER JOIN users 		ON users.id = bets.id_user
        LEFT JOIN users_icon    ON users.id = users_icon.id_user
        WHERE bets.id_user = ?
        AND bets.id_match IN (?)
        GROUP BY bets.id_match, bets.id_user`,
      [userId, matchIds],
      function (err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          result(null, res);
        }
      }
    );
  }
};

Bets.extraBetsResults = async function (season) {
  const rows = asyncQuery(
    `SELECT SQL_NO_CACHE id_season as idSeason, json
        FROM extra_bets_results_new
        WHERE id_season = ?`,
    [season]
  );

  return rows;
};

Bets.extraBets = async function (season) {
  const rows = asyncQuery(
    `SELECT SQL_NO_CACHE extra_bets_new.id_user as idUser, extra_bets_new.id_season as idSeason, extra_bets_new.json,
        users.name as userName, users_icon.icon as userIcon, users_icon.color as userColor
        FROM extra_bets_new
        INNER JOIN users 		ON users.id = extra_bets_new.id_user
        LEFT JOIN users_icon    ON users.id = users_icon.id_user
        WHERE id_season = ?`,
    [season]
  );

  return rows;
};

Bets.userExtraBets = async function (season, userId) {
  const rows = asyncQuery(
    `SELECT SQL_NO_CACHE extra_bets_new.id_user as idUser, extra_bets_new.id_season as idSeason, extra_bets_new.json,
        users.name as userName, users_icon.icon as userIcon, users_icon.color as userColor
        FROM extra_bets_new
        INNER JOIN users 		ON users.id = extra_bets_new.id_user
        LEFT JOIN users_icon    ON users.id = users_icon.id_user
        WHERE extra_bets_new.id_season = ? AND extra_bets_new.id_user = ?`,
    [season, userId]
  );

  return rows;
};

Bets.updateExtras = async function (userId, season, newExtras) {
  const rows = asyncQuery(
    `INSERT INTO extra_bets_new (id_user, id_season, json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE json = ?`,
    [userId, season, newExtras, newExtras]
  );

  return rows;
};

Bets.updateRegular = async function (matchId, userId, betValue) {
  const rows = asyncQuery(
    `INSERT INTO bets (id_match, id_user, id_bet) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE id_bet = ?`,
    [matchId, userId, betValue, betValue]
  );

  return rows;
};

module.exports = Bets;
