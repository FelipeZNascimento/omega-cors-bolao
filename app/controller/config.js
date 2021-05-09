const DefaultConfig = require('../const/defaultConfig.js');
const Season = require('../model/season.js');
const Team = require('../model/team.js');

exports.default = function (req, res) {
    const season = DefaultConfig.seasonId;

    Season.getInfo(
        season > 2000
            ? SEASON_MAPPING[season]
            : season,
        function (err, response) {
            if (err) {
                res.status(400).send(err);
            } else {
                Team.getAll(
                    function (err, teams) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            const teamsByConferenceAndDivision = Team.byConferenceAndDivision(teams);

                            const seasonInfo = {
                                currentSeason: response[0].id,
                                currentWeek: DefaultConfig.currentWeek,
                                loggedUser: req.session.user,
                                teams: teams,
                                teamsByConferenceAndDivision: teamsByConferenceAndDivision
                            };

                            res.send(seasonInfo);
                        }
                    }
                );
            }
        }
    );
};
