const Cookies = require('../model/cookies.js');

exports.update = function (req, res) {
    const session = req.session;

    if (!session.user) {
        return res.status(400).send('No live session');
    }
    
    const { id, cookie } = session.user;

    Cookies.update(
        id,
        cookie,
        function (err, task) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.send(task);
            }
        }
    );
};
