// const Cookies = require('../model/cookies.js');
const DefaultConfig = require('../const/defaultConfig.js');
const Season = require('../model/season.js');

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
                const seasonInfo = {
                    currentSeason: response[0].id,
                    currentWeek: DefaultConfig.currentWeek
                };

                res.send(seasonInfo);
            }
        }
    );

};
