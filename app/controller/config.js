const Season = require('../model/season.js');
const Team = require('../model/team.js');
const User = require('../model/user.js');
const Match = require('../model/match.js');

exports.default = async function (req, res) {
    const currentSeason = process.env.SEASON;
    const seasonStart = process.env.SEASON_START;

    try {
        const allQueries = [
            Season.getInfo(currentSeason),
            Team.getAll(),
            Match.getNextMatchWeek()
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
        const weekInfo = allResults[2].value[0];
        const teamsByConferenceAndDivision = Team.byConferenceAndDivision(teams);

        if (req.session.user) {
            User.updateLastOnlineTime(req.session.user.id);
        }

        const configData = {
            currentSeason: seasonInfo.id,
            loggedUser: req.session.user,
            currentWeek: weekInfo.week,
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
