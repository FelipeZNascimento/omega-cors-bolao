const Match = require('../model/match.js');
const SEASON_MAPPING = require('../const/seasonMapping');

exports.listBySeason = function (req, res) {
    const { season } = req.params;

    Match.getBySeason(
        season > 2000
            ? SEASON_MAPPING[season]
            : season,
        function (err, task) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.send(task);
            }
        });
};

exports.listByWeek = function (req, res) {
    const { week } = req.params;

    Match.getByWeek(
        week,
        function (err, task) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.send(task);
            }
        });
};

exports.list = function (req, res) {
    const { season, week } = req.params;

    Match.getBySeasonAndWeek(
        season > 2000
            ? SEASON_MAPPING[season]
            : season,
        week,
        function (err, task) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.send(task);
            }
        });
};

exports.updateBySeason = function (req, res) {
    const matchData = new Match(req.body);
    const { key, season } = req.params;

    if (matchData.length === 0) {
        res.status(400).send({ error: true, message: 'No product found.' });
    } else if (key !== '123abc') { // Use env variable to check keys
        res.status(400).send({ error: true, message: 'Access forbidden.' });
    } else {
        Match.updateFromMatchInfo(matchData, season, function (err, task) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.json(task);
            }
        });
    }
}