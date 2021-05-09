const Team = require('../model/team.js');

exports.listAll = function (req, res) {
    Team.getAll(
        function (err, teams) {
            if (err) {
                res.status(400).send(err);
            } else {
                const teamsByConferenceAndDivision = Team.byConferenceAndDivision(teams);

                const dataObject = {
                    teamsByConferenceAndDivision: teamsByConferenceAndDivision,
                    teams: teams
                };

                res.send(dataObject);
            }
        }
    );
};