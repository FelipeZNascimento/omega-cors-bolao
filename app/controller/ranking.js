const Bets = require('../model/bets.js');
const Ranking = require('../model/ranking.js');
const User = require('../model/user.js');
const Match = require('../model/match.js');
const MaxPointsPerBet = require('../const/maxPointsPerBet');
const EXTRA_BETS_MAPPING = require('../const/extraBetsMapping');

const calculateUserExtraPoints = (user, extraBets, extraBetsResults) => {
    let extraBetsPoints = 0;
    if (extraBets === null || extraBetsResults === null) {
        return extraBetsPoints;
    }

    const userExtraBets = extraBets.find((extraBet) => extraBet.idUser === user.id);
    if (userExtraBets === undefined) {
        return extraBetsPoints;
    }

    const bets = JSON.parse(userExtraBets.json);
    const betsKeys = Object.keys(bets);

    // console.log(bets);
    // console.log(betsKeys);

    betsKeys.forEach((key) => {
        if (parseInt(key) === EXTRA_BETS_MAPPING.AFC_WILDCARD.TYPE || parseInt(key) === EXTRA_BETS_MAPPING.NFC_WILDCARD.TYPE) {
            bets[key].forEach((wcBet) => {
                if (extraBetsResults[key].find((wcBetResult) => wcBetResult === wcBet) !== undefined) {
                    extraBetsPoints += MaxPointsPerBet.Extras(parseInt(key));
                }
            })
        } else if (bets[key] === extraBetsResults[key]) {
            extraBetsPoints += MaxPointsPerBet.Extras(parseInt(key));
        }
    })

    return extraBetsPoints;
};

const calculateUserPoints = (user, matches, bets, totalPossiblePoints) => {
    let totalPoints = 0;
    let totalBullseye = 0;
    let totalWinners = 0;

    matches.forEach((match) => {
        const maxPointsPerBet = MaxPointsPerBet.RegularSeason(parseInt(match.season), parseInt(match.week));

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
}

exports.listBySeasonAndWeek = async function (req, res) {
    const { season, week } = req.params;

    Match.getBySeasonAndWeek(
        season > 2000
            ? SEASON_MAPPING[season]
            : season,
        week,
        async function (err, matches) {
            if (err) {
                res.status(400).send(err);
            } else {
                Bets.byMatchIds(
                    matches.map((match) => match.id),
                    async function (err, bets) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            try {
                                await User.getBySeason(season)
                                    .then((users) => {
                                        const totalPossiblePoints = matches.reduce((acumulator, match) =>
                                            acumulator + MaxPointsPerBet.RegularSeason(parseInt(season), parseInt(match.week))
                                            , 0);

                                        const usersObject = users.map((user) => calculateUserPoints(user, matches, bets, totalPossiblePoints));

                                        const dataObject = {
                                            season: season,
                                            week: week,
                                            totalPossiblePoints,
                                            users: usersObject.sort((a, b) => b.totalPercentage - a.totalPercentage || b.totalBullseye - a.totalBullseye)
                                        };

                                        res.send(dataObject);

                                    })

                            } catch (err) {
                                res.status(400).send(err.message);
                            }
                        }
                    }
                )
            }
        }
    );
};

exports.listBySeason = function (req, res) {
    const { season } = req.params;

    Match.getBySeason(
        season > 2000
            ? SEASON_MAPPING[season]
            : season,
        function (err, matches) {
            if (err) {
                res.status(400).send(err);
            } else {
                Bets.byMatchIds(
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
                                        Bets.extraBets(
                                            season > 2000
                                                ? SEASON_MAPPING[season]
                                                : season,
                                            function (err, extraBets) {
                                                if (err) {
                                                    res.status(400).send(err);
                                                } else {
                                                    let extraBetsResults = null;
                                                    let extraBetsUsers = null;

                                                    if (extraBets.results.length > 0) {
                                                        extraBetsResults = JSON.parse(extraBets.results[0].json);
                                                        extraBetsUsers = extraBets.bets;
                                                    }

                                                    const totalPossiblePoints = matches.reduce((acumulator, match) =>
                                                        acumulator + MaxPointsPerBet.RegularSeason(parseInt(season), parseInt(match.week))
                                                        , 0);

                                                    const usersObject = users.map((user) => {
                                                        const totalExtras = calculateUserExtraPoints(user, extraBetsUsers, extraBetsResults);
                                                        const userObject = calculateUserPoints(user, matches, bets, totalPossiblePoints);

                                                        userObject.totalPoints += totalExtras;
                                                        userObject.totalExtras = totalExtras;

                                                        return userObject;
                                                    });

                                                    const dataObject = {
                                                        season: season,
                                                        totalPossiblePoints,
                                                        users: usersObject.sort((a, b) => b.totalPoints - a.totalPoints || b.totalBullseye - a.totalBullseye)
                                                    };

                                                    res.send(dataObject);
                                                }
                                            }
                                        )
                                    }
                                }
                            )
                        }
                    }
                )
            }
        }
    );
};