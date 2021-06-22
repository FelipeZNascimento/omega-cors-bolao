const Bets = require('../model/bets.js');
const Ranking = require('../model/ranking.js');
const User = require('../model/user.js');
const Match = require('../model/match.js');
const MaxPointsPerBet = require('../const/maxPointsPerBet');
const EXTRA_BETS_MAPPING = require('../const/extraBetsMapping');
const SEASON_MAPPING = require('../const/seasonMapping');

const calculateUserExtraPoints = (user, extraBets, extraBetsResults) => {
    let extraBetsPoints = 0;
    if (extraBets === null || extraBetsResults === null) {
        return 0;
    }

    const userExtraBets = extraBets.find((extraBet) => extraBet.idUser === user.id);
    if (userExtraBets === undefined) {
        return 0;
    }

    const bets = JSON.parse(userExtraBets.json);
    const betsKeys = Object.keys(bets);

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

    const fiveMinAgo = Date.now() - (1000 * 60 * 5);
    let isOnline = false;
    if (new Date(user.timestamp).getTime() >= fiveMinAgo) {
        isOnline = true;
    }

    return ({
        isOnline,
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

exports.listRecords = async function (req, res) {
    let { accumulated, limit, orderBy, sortAsc, season, week, userId } = req.body;

    try {
        let normalizedSeason = season;
        if (season !== null) {
            normalizedSeason = season > 2000
                ? SEASON_MAPPING[season]
                : season;
        }

        if (accumulated) {
            await Ranking.getCheckpoints(normalizedSeason, week, userId)
                .then((records) => {
                    res.send(records);
                })
        } else {
            if (!Ranking.sortableColumns.includes(orderBy)) {
                orderBy = Ranking.sortableColumns[0];
            }

            await Ranking.getRecords(orderBy, sortAsc, limit, normalizedSeason, week, userId)
                .then((records) => {
                    res.send(records);
                })
        }

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
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
                                        const fiveMinAgo = Math.floor(Date.now() / 1000) - (60 * 5);
                                        // if(users.timestamp >= fiveMinAgo) {

                                        // }

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

exports.listBySeason = async function (req, res) {
    const { season } = req.params;
    const normalizedSeason = season > 2000
        ? SEASON_MAPPING[season]
        : season;

    try {
        const allQueries = [
            Match.getBySeason(normalizedSeason),
            User.getBySeason(normalizedSeason),
            Bets.extraBets(normalizedSeason),
            Bets.extraBetsResults(normalizedSeason)
        ];

        const allResults = await Promise.allSettled(allQueries);
        const errors = allResults
            .filter(p => p.status === 'rejected')
            .map(p => p.reason);

        if (errors.length > 0) {
            const errorMessage = errors.map((error) => error);
            throw new Error(errorMessage);
        }

        const matches = allResults[0].value;
        const users = allResults[1].value;
        const extraBets = allResults[2].value;
        const extraBetsResults = allResults[3].value.length > 0 ? JSON.parse(allResults[3].value[0].json) : null;

        Bets.byMatchIds(
            matches.map((match) => match.id),
            async function (err, bets) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    const totalPossiblePoints = matches.reduce((acumulator, match) =>
                        acumulator + MaxPointsPerBet.RegularSeason(parseInt(normalizedSeason), parseInt(match.week))
                        , 0);

                    const usersObject = users.map((user) => {
                        const totalExtras = calculateUserExtraPoints(user, extraBets, extraBetsResults);
                        const userObject = calculateUserPoints(user, matches, bets, totalPossiblePoints);

                        userObject.totalPoints += totalExtras;
                        userObject.totalExtras = totalExtras;

                        return userObject;
                    });

                    const dataObject = {
                        season: normalizedSeason,
                        totalPossiblePoints,
                        users: usersObject.sort((a, b) => b.totalPoints - a.totalPoints || b.totalBullseye - a.totalBullseye)
                    };

                    res.send(dataObject);
                }
            });
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    };
};