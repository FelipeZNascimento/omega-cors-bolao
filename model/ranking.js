const { promisify } = require("util");
// node native promisify
var sql = require("../sql/sql");
const asyncQuery = promisify(sql.query).bind(sql);

var Ranking = function (ranking) {
  this.ranking = ranking.ranking;
};

Ranking.sortableColumns = [
  "percentage",
  "points",
  "bullseye",
  "winners",
  "week",
  "userId",
];

Ranking.getRecords = async function (sortAsc, limit, season, week, userId) {
  let baseQuery = `SELECT ranking_weekly.userId, ranking_weekly.seasonId, ranking_weekly.week, ranking_weekly.points,
        ranking_weekly.bullseye, ranking_weekly.winners, ROUND(ranking_weekly.percentage * 100, 2) as percentage,
        ranking_weekly.numOfBets, ranking_weekly.numOfGames,
        users.name as userName, users_icon.icon as userIcon, users_icon.color as userColor,
        SUM(ranking_weekly.numOfGames * ranking_weekly.pointsPerGame) as pointsAvailable,
        seasons.description as season
        FROM ranking_weekly
        INNER JOIN users 		ON users.id = ranking_weekly.userId
        INNER JOIN seasons 		ON seasons.id = ranking_weekly.seasonId
        LEFT JOIN users_icon    ON users_icon.id_user = ranking_weekly.userId
        WHERE numOfBets >= 10`;
  const preparedParams = [];

  if (week) {
    baseQuery += ` AND week = ?`;
    preparedParams.push(week);
  }

  if (season) {
    baseQuery += ` AND seasonId = ?`;
    preparedParams.push(season);
  }

  if (userId) {
    baseQuery += ` AND userId = ?`;
    preparedParams.push(userId);
  }

  baseQuery += sortAsc
    ? ` ORDER BY percentage ASC, bullseye ASC, winners ASC`
    : ` ORDER BY percentage DESC, bullseye DESC, winners DESC`;

  const rows = asyncQuery(
    `${baseQuery}
        LIMIT ?`,
    [...preparedParams, limit]
  );

  return rows;
};

Ranking.getCheckpoints = async function (season, week, userId) {
  let baseQuery = `SELECT *, ROUND((points / pointsAvailable) * 100, 2) as percentage FROM (
            SELECT ranking_weekly.userId, ranking_weekly.seasonId, SUM(ranking_weekly.points) as points,
            SUM(ranking_weekly.bullseye) as bullseye, SUM(ranking_weekly.winners) as winners,
            SUM(ranking_weekly.numOfBets) as numOfBets, SUM(ranking_weekly.numOfGames) as numOfGames,
            SUM(ranking_weekly.numOfGames * ranking_weekly.pointsPerGame) as pointsAvailable,
            users.name as userName, users_icon.icon as userIcon, users_icon.color as userColor,
            seasons.description as season
            FROM ranking_weekly
            INNER JOIN users 		ON users.id = ranking_weekly.userId
            INNER JOIN seasons 		ON seasons.id = ranking_weekly.seasonId
            LEFT JOIN users_icon    ON users_icon.id_user = ranking_weekly.userId
            WHERE week <= ?`;
  const preparedParams = [week];

  if (season) {
    baseQuery += ` AND seasonId = ?`;
    preparedParams.push(season);
  }

  if (userId) {
    baseQuery += ` AND userId = ?`;
    preparedParams.push(userId);
  }

  const rows = asyncQuery(
    `${baseQuery}
        GROUP BY ranking_weekly.userId, ranking_weekly.seasonId) tmp
        ORDER BY percentage DESC, bullseye DESC, winners DESC
        LIMIT 20`,
    [...preparedParams]
  );

  return rows;
};

Ranking.updateWeekly = async function (data) {
  const rows = asyncQuery(
    `INSERT INTO ranking_weekly (userId, seasonId, week, points, bullseye, winners, percentage, numOfBets, numOfGames, pointsPerGame) VALUES ?`,
    [data]
  );
};

module.exports = Ranking;
