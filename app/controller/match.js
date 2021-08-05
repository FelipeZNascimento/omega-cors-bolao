const Match = require('../model/match.js');
const Bets = require('../model/bets.js');
const User = require('../model/user.js');
const Sort = require('../utilities/sort');
const SEASON_MAPPING = require('../const/seasonMapping');
const MATCH_STATUS = require('../const/matchStatus');

exports.listBySeason = async function (req, res) {
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
    const { season, week } = req.params;
    const normalizedSeason = season > 2000
        ? SEASON_MAPPING[season]
        : season;

    if (req.session.user) {
        User.updateLastOnlineTime(req.session.user.id);
    }

    Match.getBySeasonAndWeek(
        normalizedSeason,
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
                                        status: parseInt(match.status),
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

exports.updateBySeason = async function (req, res) {
    const matchData = new Match(req.body);
    const { key, season } = req.params;
    const normalizedSeason = season > 2000
        ? SEASON_MAPPING[season]
        : season;

    if (req.session.user) {
        User.updateLastOnlineTime(req.session.user.id);
    }

    if (key !== process.env.API_UPDATE_KEY) { // Use env variable to check keys
        return res.status(400).send({ error: true, message: 'Access forbidden.' });
    } else {
        try {
            if (matchData.status === MATCH_STATUS.NOT_STARTED) {
                if (matchData.overUnder == null
                    || matchData.homeTeamOdds == null
                    || matchData.awayTeamCode == null
                    || matchData.homeTeamCode == null
                    || matchData.week == null) {
                    return res.status(400).send({ error: true, message: 'Missing parameters.' });
                }
                await Match.updateOddsMatchInfo(
                    matchData,
                    normalizedSeason
                )
                    .then(async (task) => {
                        res.send(task);
                    })
            } else {
                if (matchData.awayPoints == null
                    || matchData.homePoints == null
                    || matchData.status == null
                    || matchData.possession == null
                    || matchData.clock == null
                    || matchData.awayTeamCode == null
                    || matchData.homeTeamCode == null
                    || matchData.week == null) {
                    return res.status(400).send({ error: true, message: 'Missing parameters.' });
                }

                await Match.updateFromMatchInfo(
                    matchData,
                    normalizedSeason
                )
                    .then(async (task) => {
                        res.send(task);
                    })
            }
        } catch (err) {
            console.log(err);
            res.status(400).send(err.message);
        }
    }
}