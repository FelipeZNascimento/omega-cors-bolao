'use strict';
module.exports = function (app) {
    const matchController = require('../controller/match');
    const userController = require('../controller/user');

    // Matches Routing
    app.route('/bolaonfl/matches/update/:season/:key')
        .get(matchController.updateBySeason)

    app.route('/bolaonfl/matches/season/:season/')
        .get(matchController.listBySeason)

    app.route('/bolaonfl/matches/week/:week/')
        .get(matchController.listByWeek)

    app.route('/bolaonfl/matches/:season/:week')
        .get(matchController.list)

    app.route('/bolaonfl/users/')
        .get(userController.listAll)

    app.route('/bolaonfl/users/:id')
        .get(userController.listById)
};
