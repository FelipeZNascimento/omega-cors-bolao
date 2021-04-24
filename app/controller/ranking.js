const Bets = require('../model/bets.js');
const Ranking = require('../model/ranking.js');
const User = require('../model/user.js');
const Match = require('../model/match.js');
const Sort = require('../utilities/sort');
const MaxPointsPerBet = require('../const/maxPointsPerBet');

exports.listBySeasonAndWeek = function (req, res) {
    const { season, week } = req.params;

    const maxPointsPerBet = MaxPointsPerBet.RegularSeason(parseInt(season), parseInt(week));
    Match.getBySeasonAndWeek(
        season > 2000
            ? SEASON_MAPPING[season]
            : season,
        week,
        function (err, matches) {
            if (err) {
                res.status(400).send(err);
            } else {
                const totalPossiblePoints = matches.length * maxPointsPerBet;
                Bets.bySeasonAndWeek(
                    matches.map((match) => match.id),
                    function (err, bets) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            User.getBySeason(
                                season,
                                function (err, users) {
                                    if (err) {
                                        res.status(400).send(err);
                                    } else {
                                        const usersObject = users.map((user) => {
                                            let totalPoints = 0;
                                            let totalBullseye = 0;
                                            let totalWinners = 0;

                                            matches.forEach((match) => {
                                                const matchBets = bets
                                                    .filter((bet) => bet.matchId === match.id)
                                                    .filter((bet) => bet.userId === user.id);

                                                const betValue = matchBets.length > 0 ? matchBets[0].betValue : null;
                                                const betPoints = Ranking.returnPoints(match, betValue, maxPointsPerBet);
                                                totalPoints += betPoints;

                                                if (betPoints > 0) {
                                                    totalWinners++;
                                                    if (betPoints === maxPointsPerBet) {
                                                        totalBullseye++;
                                                    }
                                                }
                                            });

                                            const totalPercentage = (totalPoints / totalPossiblePoints) * 100;

                                            return ({
                                                id: user.id,
                                                name: user.name,
                                                icon: user.icon,
                                                color: user.color,
                                                totalPoints,
                                                totalBullseye,
                                                totalWinners,
                                                totalPercentage: totalPercentage.toFixed(1),
                                            })
                                        });

                                        const dataObject = {
                                            season: season,
                                            week: week,
                                            totalPossiblePoints,
                                            users: usersObject.sort((a, b) => b.totalPercentage - a.totalPercentage || b.totalBullseye - a.totalBullseye)
                                        };

                                        res.send(dataObject);
                                    }
                                })
                        }
                    }
                )
            }
        }
    );
};