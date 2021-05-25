const DefaultConfig = require('../const/defaultConfig.js');
const Season = require('../model/season.js');
const Team = require('../model/team.js');
const SEASON_MAPPING = require('../const/seasonMapping');

exports.default = async function (req, res) {
    const currentSeason = DefaultConfig.seasonId;
    const seasonStart = process.env.SEASON_START;

    try {
        const allQueries = [
            Season.getInfo(currentSeason),
            Team.getAll()
        ];

        const allResults = await Promise.allSettled(allQueries);
        const errors = allResults
            .filter(p => p.status === 'rejected')
            .map(p => p.reason);

        if (errors.length > 0) {
            const errorMessage = errors.map((error) => error);
            throw new Error(errorMessage);
        }

        const seasonInfo = allResults[0].value[0];
        const teams = allResults[1].value;
        const teamsByConferenceAndDivision = Team.byConferenceAndDivision(teams);

        const configData = {
            currentSeason: seasonInfo.id,
            currentWeek: DefaultConfig.currentWeek,
            loggedUser: req.session.user,
            seasonStart,
            teams,
            teamsByConferenceAndDivision: teamsByConferenceAndDivision
        };

        res.send(configData);

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};
