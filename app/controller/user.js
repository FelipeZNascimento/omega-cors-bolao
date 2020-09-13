const User = require('../model/user.js');

exports.listAll = function (req, res) {
    User.getAll(
        function (err, task) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.send(task);
            }
        });
};

exports.listById = function (req, res) {
    const { id } = req.params;

    User.getById(
        id,
        function (err, task) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.send(task);
            }
        });
};
