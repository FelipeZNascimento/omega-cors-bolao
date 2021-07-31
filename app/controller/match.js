const Match = require('../model/match.js');
const Bets = require('../model/bets.js');
const User = require('../model/user.js');
const Sort = require('../utilities/sort');
const SEASON_MAPPING = require('../const/seasonMapping');

exports.listBySeason = async function (req, res) {
    console.log('Routing to match listBySeason');
    const { season } = req.params;
    const normalizedSeason = season > 2000
        ? SEASON_MAPPING[season]
        : season;

    if (req.session.user) {
        User.updateLastOnlineTime(req.session.user.id);
    }

    try {
        await Match.getBySeason(normalizedSeason)
            .then(async (matches) => {
                res.send(matches);
            })
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

exports.listByWeek = async function (req, res) {
    console.log('Routing to match listByWeek');
    const { week } = req.params;

    if (req.session.user) {
        User.updateLastOnlineTime(req.session.user.id);
    }

    try {
        await Match.getByWeek(week)
            .then(async (matches) => {
                res.send(matches);
            })
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

exports.list = function (req, res) {
    console.log('Routing to match list');
    const { season, week } = req.params;

    if (req.session.user) {
        User.updateLastOnlineTime(req.session.user.id);
    }

    Match.getBySeasonAndWeek(
        season > 2000
            ? SEASON_MAPPING[season]
            : season,
        week,
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
                            const sessionUser = req.session.user === undefined ? null : req.session.user;
                            const sessionUserId = req.session.user === undefined ? null : req.session.user.id;

                            const matchesObject = matches.map((match) => {
                                const loggedUserBetsObject = sessionUser === null
                                    ? null
                                    : bets
                                        .filter((bet) => bet.matchId === match.id)
                                        .filter((bet) => bet.userId === sessionUserId)
                                        .map((bet) => (
                                            {
                                                id: bet.id,
                                                matchId: bet.matchId,
                                                value: bet.betValue,
                                                user: {
                                                    id: bet.userId,
                                                    icon: bet.userIcon,
                                                    color: bet.userColor,
                                                    name: bet.userName
                                                }
                                            }
                                        ))[0];

                                const betsObject = bets
                                    .filter((bet) => bet.matchId === match.id)
                                    .filter((bet) => bet.userId !== sessionUserId)
                                    .sort(Sort.dynamic('userName'))
                                    .map((bet) => (
                                        {
                                            id: bet.id,
                                            matchId: bet.matchId,
                                            value: bet.betValue,
                                            user: {
                                                id: bet.userId,
                                                icon: bet.userIcon,
                                                color: bet.userColor,
                                                name: bet.userName
                                            }
                                        }
                                    ));

                                return (
                                    {
                                        id: match.id,
                                        timestamp: match.timestamp,
                                        status: match.status,
                                        away: {
                                            id: match.idTeamAway,
                                            name: match.teamAway,
                                            alias: match.teamAwayAlias,
                                            code: match.teamAwayCode,
                                            possession: match.possession === 'away',
                                            score: match.awayScore,
                                            background: match.teamAwayBackground,
                                            foreground: match.teamAwayForeground
                                        },
                                        home: {
                                            id: match.idTeamHome,
                                            name: match.teamHome,
                                            alias: match.teamHomeAlias,
                                            code: match.teamHomeCode,
                                            possession: match.possession === 'home',
                                            score: match.homeScore,
                                            background: match.teamHomeBackground,
                                            foreground: match.teamHomeForeground,
                                        },
                                        loggedUserBets: loggedUserBetsObject,
                                        bets: betsObject
                                    }
                                )
                            });

                            const dataObject = {
                                season: season,
                                week: week,
                                matches: matchesObject
                            };

                            res.send(dataObject);
                        }
                    }
                )
            }
        }
    );
};

exports.updateBySeason = function (req, res) {
    console.log('Routing to match updateBySeason');
    const matchData = new Match(req.body);
    const { key, season } = req.params;

    if (req.session.user) {
        User.updateLastOnlineTime(req.session.user.id);
    }

    if (matchData.length === 0) {
        res.status(400).send({ error: true, message: 'No matches found.' });
    } else if (key !== process.env.API_UPDATE_KEY) { // Use env variable to check keys
        res.status(400).send({ error: true, message: 'Access forbidden.' });
    } else {
        Match.updateFromMatchInfo(
            matchData,
            season,
            function (err, task) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.json(task);
                }
            }
        );
    }
}