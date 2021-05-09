const validateEmail = require('../utilities/emailChecker');
const User = require('../model/user.js');

async function checkExistingValues(email, name, logedUserId = null) {
    const allQueries = [
        User.checkEmail(email, logedUserId || ''),
        User.checkName(name, logedUserId || '')
    ];

    const allResults = await Promise.allSettled(allQueries);
    const errors = allResults
        .filter(p => p.status === 'rejected')
        .map(p => p.reason);

    if (errors.length > 0) {
        return 'Connection error.';
    }

    let errorMessage = '';
    if (allResults[0].value.length > 0) {
        errorMessage += 'Email já está sendo usado.'
    }

    if (allResults[1].value.length > 0) {
        errorMessage += ' Nome já está sendo usado.'
    }

    return errorMessage;
}

exports.update = async function (req, res) {
    const userData = new User(req.body);

    try {
        if (!req.session.user) {
            throw new Error('No live session');
        };

        const { user } = req.session;

        if (!validateEmail(userData.email)) {
            throw new Error('Invalid email');
        }

        const checkResult = await checkExistingValues(userData.email, userData.name, user.id);

        if (checkResult !== '') {
            throw new Error(checkResult);
        }

        if (userData.name === '') {
            userData.name = user.name;
        }

        const allQueries = [
            User.updateInfo(user.id, userData)
        ];

        if (userData.newPassword) {
            allQueries.push(User.updatePassword(user.id, userData));
        }

        const allResults = await Promise.allSettled(allQueries);
        const errors = allResults
            .filter(p => p.status === 'rejected')
            .map(p => p.reason);

        if (errors.length > 0) {
            const errorMessage = errors.map((error) => error);
            throw new Error(errorMessage);
        }

        await User.getById(user.id)
            .then((user) => {
                const newUser = new User(user[0]);
                req.session.user = newUser;
                res.send(newUser);
            })

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

exports.listAll = async function (req, res) {
    try {
        await User.getAll()
            .then((list) => {
                res.send(list);
            })

    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.listById = async function (req, res) {
    const { id } = req.params;

    try {
        await User.getById(id)
            .then((user) => {
                res.send(user);
            })

    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.register = async function register(req, res) {
    const season = process.env.SEASON;
    const userData = new User(req.body);

    try {
        if (!userData.email || !userData.password || !userData.name || !userData.fullName) {
            throw new Error('Missing parameters');
        }
        const checkResult = await checkExistingValues(userData.email, userData.name);

        if (checkResult !== '') {
            throw new Error(checkResult);
        }

        await User.register(userData)
            .then(async (result) => {

                const allQueries = [
                    User.setOnCurrentSeason(season, result.insertId),
                    User.setIcons(result.insertId)
                ];

                const allResults = await Promise.allSettled(allQueries);
                const errors = allResults
                    .filter(p => p.status === 'rejected')
                    .map(p => p.reason);

                if (errors.length > 0) {
                    throw new Error('Connection error.');
                }

                await User.login(season, userData)
                    .then((loginResult) => {
                        if (loginResult.length > 0) {
                            const newUser = new User(loginResult[0]);
                            req.session.user = newUser
                            res.send(newUser);
                        } else {
                            res.send(null);
                        }
                    })

            })
    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.login = async function (req, res) {
    if (req.session.user) {
        return res.status(400).send('User already logged in.');
    };

    const season = process.env.SEASON;
    const userData = new User(req.body);

    try {
        if (!userData.email || !userData.password) {
            throw new Error('Missing parameters');
        }
        await User.login(season, userData)
            .then((loginResult) => {
                if (loginResult.length > 0) {
                    req.session.user = new User(loginResult[0]);
                    res.send(loginResult[0]);
                } else {
                    res.send(null);
                }
            })

    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.logout = function (req, res) {
    if (!req.session.user) {
        return res.status(400).send('Logout: User not found.');
    }

    req.session.destroy();
    res.status(200).send('');
};
