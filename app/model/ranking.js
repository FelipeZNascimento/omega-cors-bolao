const { promisify } = require('util');
// node native promisify
var sql = require('../../sql/sql');
const asyncQuery = promisify(sql.query).bind(sql);
const BET_VALUES = require('../const/betValues');

var Ranking = function (ranking) {
    this.ranking = ranking.ranking;
};

Ranking.sortableColumns = [
    'percentage',
    'points',
    'bullseye',
    'winners',
    'week',
    'userId',
];

Ranking.returnPoints = (match, betValue, maxPoints) => {
    if (match.awayScore - match.homeScore > 0) { //away team won
        if (match.awayScore - match.homeScore > 7) { //away team won by more than 7 points (easy win)
            if (betValue === BET_VALUES.AWAY_EASY) {
                return maxPoints;
            } else if (betValue === 1) {
                return (maxPoints / 2);
            } else {
                return 0;
            }
        } else { // hard win
            if (betValue === BET_VALUES.AWAY_EASY) {
                return (maxPoints / 2);
            } else if (betValue === 1) {
                return maxPoints;
            } else {
                return 0;
            }
        }
    } else if (match.homeScore - match.awayScore > 0) {
        if (match.homeScore - match.awayScore > 7) {
            if (betValue === BET_VALUES.HOME_EASY) {
                return maxPoints;
            } else if (betValue === 2) {
                return (maxPoints / 2);
            } else {
                return 0;
            }
        } else {
            if (betValue === BET_VALUES.HOME_EASY) {
                return (maxPoints / 2);
            } else if (betValue === 2) {
                return (maxPoints);
            } else {
                return 0;
            }
        }
    } else {
        if (betValue === BET_VALUES.AWAY_HARD || betValue === BET_VALUES.HOME_HARD) {
            return (maxPoints / 2);
        }
    }

    return 0;
};

Ranking.getRecords = async function (orderBy, sortAsc, limit, season, week, userId) {
    let baseQuery =
        `SELECT ranking_weekly.userId, ranking_weekly.seasonId, ranking_weekly.week, ranking_weekly.points,
        ranking_weekly.bullseye, ranking_weekly.winners, ranking_weekly.percentage, ranking_weekly.numOfBets, ranking_weekly.numOfGames,
        users.name as userName, users_icon.icon as userIcon, users_icon.color as userColor,
        seasons.description as season
        FROM ranking_weekly
        INNER JOIN users 		ON users.id = ranking_weekly.userId
        INNER JOIN seasons 		ON seasons.id = ranking_weekly.seasonId
        LEFT JOIN users_icon    ON users_icon.id_user = ranking_weekly.userId
        WHERE numOfBets >= 10`;
    const preparedParams = [];

    if (week) {
        baseQuery += accumulated
            ? ` AND week <= ?`
            : ` AND week = ?`;
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

    const rows = asyncQuery(
        `${baseQuery}
        ORDER BY ?? ${sortAsc ? 'ASC' : 'DESC'}
        LIMIT ?`,
        [...preparedParams, orderBy, limit]
    );

    return rows;
};

Ranking.getCheckpoints = async function (season, week, userId) {
    let baseQuery =
        `SELECT *, ROUND((points / pointsAvailable) * 100, 2) as percentage FROM (
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

module.exports = Ranking;
