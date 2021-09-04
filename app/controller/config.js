const Season = require('../model/season.js');
const User = require('../model/user.js');
const Match = require('../model/match.js');

const TeamController = require('../controller/team.js');
const CACHE_KEYS = require('../const/cacheValues');
const cachedInfo = require('../utilities/cache');

exports.default = async function (req, res) {
    const currentSeason = process.env.SEASON;
    const seasonStart = process.env.SEASON_START;

    try {
        const allQueries = [
            Season.getInfo(currentSeason),
            Match.getNextMatchWeek()
        ];

        let teams = cachedInfo.get(CACHE_KEYS.TEAMS);
        let teamsByConferenceAndDivision = cachedInfo.get(CACHE_KEYS.TEAMS_BY_CONFERENCE_AND_DIVISION);

        if (teams == undefined || teamsByConferenceAndDivision == undefined) {
            const fetchedTeams = await TeamController.fetchFromESPNApi();
            teams = fetchedTeams.teams;
            teamsByConferenceAndDivision = fetchedTeams.teamsByConferenceAndDivision;
        }

        const allResults = await Promise.allSettled(allQueries);
        const errors = allResults
            .filter(p => p.status === 'rejected')
            .map(p => p.reason);

        if (errors.length > 0) {
            const errorMessage = errors.map((error) => error);
            throw new Error(errorMessage);
        }

        const seasonInfo = allResults[0].value[0];
        const weekInfo = allResults[1].value[0];

        if (req.session.user) {
            User.updateLastOnlineTime(req.session.user.id);
        }

        const configData = {
            currentSeason: seasonInfo.id,
            currentWeek: weekInfo.week,
            loggedUser: req.session.user,
            seasonStart,
            teams,
            teamsByConferenceAndDivision,
        };

        res.send(configData);

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};
