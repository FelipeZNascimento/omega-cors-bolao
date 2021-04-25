const Bets = require('../model/bets.js');

exports.listExtraBets = function (req, res) {
    const { season } = req.params;

    Bets.extraBets(
        season,
        function (err, task) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.send(task);
            }
        }
    );
};
