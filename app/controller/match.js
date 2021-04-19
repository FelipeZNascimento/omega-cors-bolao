const Match = require('../model/match.js');
const Bets = require('../model/bets.js');
const dynamicSort = require('../utilities/sort');
const SEASON_MAPPING = require('../const/seasonMapping');

exports.listBySeason = function (req, res) {
    console.log('Routing to match listBySeason');
    const { season } = req.params;

    Match.getBySeason(
        season > 2000
            ? SEASON_MAPPING[season]
            : season,
        function (err, task) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.send(task);
            }
        }
    );
};

exports.listByWeek = function (req, res) {
    console.log('Routing to match listByWeek');
    const { week } = req.params;

    Match.getByWeek(
        week,
        function (err, task) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.send(task);
            }
        }
    );
};

exports.list = function (req, res) {
    console.log('Routing to match list');
    const { season, week } = req.params;

    Match.getBySeasonAndWeek(
        season > 2000
            ? SEASON_MAPPING[season]
            : season,
        week,
        function (err, matches) {
            if (err) {
                res.status(400).send(err);
            } else {
                Bets.bySeasonAndWeek(
                    matches.map((match) => match.id),
                    function (err, bets) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            const matchesObject = matches.map((match) => {
                                const loggedUserBetsObject = req.session.user === null
                                    ? null
                                    : bets
                                        .filter((bet) => bet.matchId === match.id)
                                        .filter((bet) => bet.userId === req.session.user.id)
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
                                    .filter((bet) => bet.userId !== req.session.user.id)
                                    .sort(dynamicSort('userName'))
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

    if (matchData.length === 0) {
        res.status(400).send({ error: true, message: 'No product found.' });
    } else if (key !== '123abc') { // Use env variable to check keys
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