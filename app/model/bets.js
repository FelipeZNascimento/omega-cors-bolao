var sql = require('../../sql/sql');

var Bets = function (bet) {
    this.bet = bet.bet;
};

Bets.byMatchIds = function (matchIds, result) {
    sql.query(
        `SELECT bets.id, bets.id_bet as betValue, bets.id_user as userId, bets.id_match as matchId,
        users.name as userName, users_icon.icon as userIcon, users_icon.color as userColor
        FROM bets
        INNER JOIN matches 		ON matches.id = bets.id_match
        INNER JOIN users 		ON users.id = bets.id_user
        LEFT JOIN users_icon    ON users.id = users_icon.id_user
        WHERE matches.timestamp <= UNIX_TIMESTAMP()
        AND bets.id_match IN (?)
        AND bets.timestamp = (
        SELECT MAX(b2.timestamp) FROM bets AS b2 WHERE b2.id_match = bets.id_match AND b2.id_user = bets.id_user)
        GROUP BY bets.id_match, bets.id_user`,
        [matchIds],
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

Bets.extraBets = function (season, result) {
    sql.query(
        `SELECT SQL_NO_CACHE id_season as idSeason, json
        FROM extra_bets_results_new
        WHERE id_season = ?`,
        [season],
        function (err, extraBetsResults) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            }
            else {
                sql.query(
                    `SELECT SQL_NO_CACHE id_user as idUser, id_season as idSeason, json
                    FROM extra_bets_new
                    WHERE id_season = ?`,
                    [season],
                    function (err, res) {
                        if (err) {
                            console.log("error: ", err);
                            result(err, null);
                        }
                        else {
                            const extraBetsObject = {
                                results: extraBetsResults,
                                bets: res
                            };

                            result(null, extraBetsObject);
                        }
                    }
                );
            }
        }
    );

}
module.exports = Bets;