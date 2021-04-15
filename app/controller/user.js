const User = require('../model/user.js');
const Cookies = require('../model/cookies.js');

exports.listAll = function (req, res) {
    User.getAll(
        function (err, task) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.send(task);
            }
        }
    );
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
        }
    );
};

exports.register = function (req, res) {
    const season = process.env.SEASON;
    const userData = new User(req.query);

    if (!userData.login || !userData.password || !userData.name) {
        return res.status(400).send('Missing parameters.');
    } else {
        User.register(
            season,
            userData,
            function (err, data) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    User.login(
                        season,
                        userData,
                        function (err, data) {
                            if (err) {
                                res.status(400).send(err);
                            } else {
                                if (data.length > 0) {
                                    req.session.user = new User(data[0]);
                                }
                                res.send(data);
                            }
                        }
                    );
                }
            }
        );
    }
};

exports.login = function (req, res) {
    if (req.session.user) {
        return res.status(400).send('User already logged in.');
    };

    const season = process.env.SEASON;
    const userData = new User(req.query);

    if (userData.login && userData.password) {
        User.login(
            season,
            userData,
            function (err, data) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    if (data.length > 0) {
                        req.session.user = new User(data[0]);
                    }
                    res.send(data);
                }
            }
        );
    } else if (userData.cookies && userData.id) {
        User.loginCookies(
            season,
            userData,
            function (err, data) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    if (data.length > 0) {
                        req.session.user = new User(data[0]);
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
                    }
                    res.send(data);
                }
            }
        );
    } else {
        res.status(400).send('Missing parameters');
    }
};

exports.logout = function (req, res) {
    if (!req.session.user) {
        return res.status(400).send('Logout: User not found.');
    }

    const { cookie, id } = req.session.user;

    Cookies.delete(
        id,
        cookie,
        function (err, data) {
            if (err) {
                res.status(400).send(err);
            } else {
                req.session.destroy();
                res.send(data);
            }
        }
    )
};

exports.check = function (req, res) {
    const { login, name } = req.query;

    if (login) {
        User.checkEmail(
            login,
            function (err, data) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.send(data);
                }
            }
        )
    } else if (name) {
        User.checkName(
            name,
            function (err, data) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.send(data);
                }
            }
        )
    } else {
        res.status(400).send('Missing parameters');
    }
}