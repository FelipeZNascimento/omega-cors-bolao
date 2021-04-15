const Ranking = require('../model/ranking.js');
const User = require('../model/user.js');

exports.listBySeason = function (req, res) {
    const { season } = req.params;

    User.getBySeason(
        season,
        function (err, data) {
            if (err) {
                res.status(400).send(err);
            } else {
                console.log(data);
                res.send(data);                
            }
        }
    );

    // Ranking.bySeason(
    //     season,
    //     function (err, task) {
    //         if (err) {
    //             res.status(400).send(err);
    //         } else {
    //             res.send(task);
    //         }
    //     }
    // );
};