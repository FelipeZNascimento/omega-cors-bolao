'use strict';
module.exports = function (app) {
    const matchController = require('../controller/match');

    // Matches Routing
    app.route('/bolaonfl/matches/update/:season/:key')
        .get(matchController.updateBySeason)

    app.route('/bolaonfl/matches/season/:season/')
        .get(matchController.listBySeason)

    app.route('/bolaonfl/matches/week/:week/')
        .get(matchController.listByWeek)

    app.route('/bolaonfl/matches/:season/:week')
        .get(matchController.list)
};
