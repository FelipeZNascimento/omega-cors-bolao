const Team = require('../model/team.js');

exports.listAll = function (req, res) {
    Team.getAll(
        function (err, task) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.send(task);
            }
        }
    );
};