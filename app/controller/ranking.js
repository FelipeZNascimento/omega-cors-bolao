const Bets = require('../model/bets.js');
const Ranking = require('../model/ranking.js');
const User = require('../model/user.js');
const Match = require('../model/match.js');

exports.listBySeasonAndWeek = function (req, res) {
    const { season, week } = req.params;

    let betsObject;
    Match.getBySeasonAndWeek(
        season,
        week,
        function (err, gamesData) {
            if (err) {
                res.status(400).send(err);
            } else {
                gamesData.map((game) => {
                    Bets.bySeasonAndWeek(season, week, game, function (err, betData) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            betsObject = ({
                                id: game.id,
                                bets: betData.map((bet) => ({
                                    id: bet.id,
                                    betId: bet.betId,
                                    userId: bet.userId
                                }))
                            });
                        }
                    });
                });
            }
        }
    );

    // Returns null because object is not set on return
    res.send(betsObject);


    // Ranking.bySeason(
    //     season,
    //     function (err, task) {
    //         if (err) {
    //             res.status(400).send(err);
    //         } else {
    //             res.send(task);
    //         }
    //     }
    // );
};