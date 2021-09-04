const Bets = require('../model/bets.js');
const Match = require('../model/match.js');
const User = require('../model/user.js');

const TeamController = require('../controller/team.js');
const cachedInfo = require('../utilities/cache.js');
const CACHE_KEYS = require('../const/cacheValues');
const SEASON_MAPPING = require('../const/seasonMapping');

exports.listExtraBets = async function (req, res) {
    const { season } = req.params;
    const { user } = req.session;

    if (!user) {
        throw new Error('No live session');
    }

    const nowTimestamp = Math.floor(new Date().getTime() / 1000);
    const seasonStart = process.env.SEASON_START;

    const normalizedSeason = season > 2000
        ? SEASON_MAPPING[season]
        : season;

    const allQueries = [
        Bets.userExtraBets(normalizedSeason, user.id)
    ];

    if (nowTimestamp >= seasonStart) {
        allQueries.push(Bets.extraBetsResults(normalizedSeason));
        allQueries.push(Bets.extraBets(normalizedSeason));
    }

    const allResults = await Promise.allSettled(allQueries);
    const errors = allResults
        .filter(p => p.status === 'rejected')
        .map(p => p.reason);

    if (errors.length > 0) {
        const errorMessage = errors.map((error) => error);
        throw new Error(errorMessage);
    }

    const userExtraBets = allResults[0].value[0] ? JSON.parse(allResults[0].value[0].json) : null;
    let extraBetsResults = null;
    let extraBets = [];
    let extraBetsPerUser = [];

    if (nowTimestamp >= seasonStart) {
        extraBetsResults = allResults[1].value.length > 0 ? JSON.parse(allResults[1].value[0].json) : null;
        extraBets = allResults[2].value;

        if (extraBets.length > 0) {
            extraBetsPerUser = extraBets.map((extraBet) => {
                return ({
                    userId: extraBet.idUser,
                    username: extraBet.userName,
                    icon: extraBet.userIcon,
                    color: extraBet.userColor,
                    bets: JSON.parse(extraBet.json)
                })
            });
        }
    }

    const dataObject = {
        season,
        results: extraBetsResults,
        bets: extraBetsPerUser,
        userBets: userExtraBets
    };

    User.updateLastOnlineTime(user.id);
    res.send(dataObject);
};

exports.listBetsBySeasonAndWeek = async function (req, res) {
    if (!req.session.user) {
        return res.status(400).send('No live session');
    }

    const { user } = req.session;
    const { season, week } = req.params;

    let teams = cachedInfo.get(CACHE_KEYS.TEAMS);
    if (teams == undefined) {
        const fetchedTeams = await TeamController.fetchFromESPNApi();
        teams = fetchedTeams.teams;
    }

    const sessionUser = user === undefined ? null : user;
    const sessionUserId = user === undefined ? null : user.id;
    const normalizedSeason = season > 2000
        ? SEASON_MAPPING[season]
        : season;

    Match.getBySeasonAndWeek(
        normalizedSeason,
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

                                const awayTeam = teams.find((team) => team.id === match.idTeamAway);
                                const homeTeam = teams.find((team) => team.id === match.idTeamHome);
                                return (
                                    {
                                        id: match.id,
                                        timestamp: match.timestamp,
                                        status: match.status,
                                        away: {
                                            id: awayTeam.id,
                                            name: awayTeam.name,
                                            alias: awayTeam.alias,
                                            code: awayTeam.code,
                                            background: awayTeam.background,
                                            foreground: awayTeam.foreground,
                                            winLosses: awayTeam.winLosses,
                                            possession: match.possession === 'away',
                                            score: match.awayScore,
                                        },
                                        home: {
                                            id: homeTeam.id,
                                            name: homeTeam.name,
                                            alias: homeTeam.alias,
                                            code: homeTeam.code,
                                            background: homeTeam.background,
                                            foreground: homeTeam.foreground,
                                            winLosses: homeTeam.winLosses,
                                            possession: match.possession === 'home',
                                            score: match.homeScore,
                                        },
                                        loggedUserBets: loggedUserBetsObject,
                                        overUnder: match.overUnder,
                                        homeTeamOdds: match.homeTeamOdds,
                                        bets: null,
                                        clock: match.clock
                                    }
                                )
                            });

                            const dataObject = {
                                season: season,
                                week: week,
                                matches: matchesObject
                            };

                            User.updateLastOnlineTime(user.id);
                            res.send(dataObject);
                        }
                    }
                )

            }
        }
    );
};

exports.updateExtraBets = async function (req, res) {
    const newExtraBets = req.body;
    const nowTimestamp = Math.floor(new Date().getTime() / 1000);
    const season = process.env.SEASON;
    const seasonStart = process.env.SEASON_START;

    const normalizedSeason = season > 2000
        ? SEASON_MAPPING[season]
        : season;

    try {
        if (!req.session.user) {
            throw new Error('No live session');
        };

        if (nowTimestamp >= seasonStart) {
            throw new Error('Season already started, update extraBets not allowed');
        }

        const { user } = req.session;
        await Bets.updateExtras(user.id, normalizedSeason, JSON.stringify(newExtraBets))
            .then(async (result) => {
                User.updateLastOnlineTime(user.id);
                res.send(result);
            })

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

exports.updateRegularBets = async function (req, res) {
    const nowTimestamp = Math.floor(new Date().getTime() / 1000);

    try {
        const betData = new Bets(req.body);
        if (!req.session.user) {
            throw new Error('No live session');
        };

        const { user } = req.session;

        await Match.getById(betData.matchId)
            .then(async (match) => {
                if (match.length > 0 && nowTimestamp >= match[0].timestamp) {
                    throw new Error('Season already started, update extraBets not allowed');
                } else {
                    await Bets.updateRegular(betData.matchId, user.id, betData.betValue)
                        .then(async (result) => {
                            User.updateLastOnlineTime(user.id);
                            res.send(result);
                        })
                }
            })
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};