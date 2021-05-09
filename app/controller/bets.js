const Bets = require('../model/bets.js');
const Match = require('../model/match.js');
const Teams = require('../model/team.js');

exports.listExtraBets = function (req, res) {
    const { season } = req.params;

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
                }

                if (extraBets.bets.length > 0) {
                    extraBetsUsers = extraBets.bets.map((extraBet) => {
                        return ({
                            userId: extraBet.idUser,
                            username: extraBet.userName,
                            icon: extraBet.userIcon,
                            color: extraBet.userColor,
                            bets: JSON.parse(extraBet.json)
                        })
                    });
                }

                const dataObject = {
                    season,
                    results: extraBetsResults,
                    bets: extraBetsUsers
                };

                res.send(dataObject);
            }
        }
    );
};

exports.listBetsBySeasonAndWeek = function (req, res) {
    console.log('Routing to match list');
    const session = req.session;

    if (!session.user) {
        return res.status(400).send('No live session');
    }

    const { season, week } = req.params;
    const sessionUser = req.session.user === undefined ? null : req.session.user;
    const sessionUserId = req.session.user === undefined ? null : req.session.user.id;

    Match.getBySeasonAndWeek(
        season > 2000
            ? SEASON_MAPPING[season]
            : season,
        week,
        function (err, matches) {
            if (err) {
                res.status(400).send(err);
            } else {
                Bets.byUserIdAndMatchIds(
                    sessionUserId,
                    matches.map((match) => match.id),
                    function (err, bets) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            const matchesObject = matches.map((match) => {
                                const loggedUserBetsObject = sessionUser === null
                                    ? null
                                    : bets
                                        .filter((bet) => bet.matchId === match.id)
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
                                        bets: null
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