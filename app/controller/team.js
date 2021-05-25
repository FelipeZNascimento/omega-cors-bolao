const Team = require('../model/team.js');

exports.listAll = async function (req, res) {
    try {
        await Team.getAll()
            .then((teams) => {
                const teamsByConferenceAndDivision = Team.byConferenceAndDivision(teams);

                const dataObject = {
                    teamsByConferenceAndDivision: teamsByConferenceAndDivision,
                    teams: teams
                };

                res.send(dataObject);
            })
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};