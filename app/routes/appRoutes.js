'use strict';
module.exports = function (app) {
    const betsController = require('../controller/bets');
    const configController = require('../controller/config');
    const matchController = require('../controller/match');
    const rankingController = require('../controller/ranking');
    const teamController = require('../controller/team');
    const userController = require('../controller/user');

    // Initial Config Routing
    app.route('/bolaonfl/defaultConfig/')
        .get(configController.default)

    // Matches Routing
    app.route('/bolaonfl/matches/update/:season/:key/')
        .post(matchController.updateBySeason)
    app.route('/bolaonfl/matches/season/:season/')
        .get(matchController.listBySeason)
    app.route('/bolaonfl/matches/week/:week/')
        .get(matchController.listByWeek)
    app.route('/bolaonfl/matches/:season/:week')
        .get(matchController.list)

    // Users Routing
    app.route('/bolaonfl/users/')
        .get(userController.listAll)
    app.route('/bolaonfl/user/update/')
        .post(userController.update)
    app.route('/bolaonfl/user/updatePreferences/')
        .post(userController.updatePreferences)
    app.route('/bolaonfl/user/register/')
        .post(userController.register)
    app.route('/bolaonfl/user/login/')
        .post(userController.login)
    app.route('/bolaonfl/user/logout/')
        .get(userController.logout)
    app.route('/bolaonfl/user/:id/')
        .get(userController.listById)

    // Teams routing
    app.route('/bolaonfl/teams/')
        .get(teamController.listAll)

    // Ranking Routing
    app.route('/bolaonfl/ranking/season/:season')
        .get(rankingController.listBySeason)
    app.route('/bolaonfl/ranking/history/:season/')
        .get(rankingController.listRankingHistory)
    app.route('/bolaonfl/ranking/:season/:week')
        .get(rankingController.listBySeasonAndWeek)

    // Bets
    app.route('/bolaonfl/bets/update/extras/')
        .post(betsController.updateExtraBets)
    app.route('/bolaonfl/bets/update/regular/')
        .post(betsController.updateRegularBets)
    app.route('/bolaonfl/bets/extras/:season/')
        .get(betsController.listExtraBets)
    app.route('/bolaonfl/bets/:season/:week')
        .get(betsController.listBetsBySeasonAndWeek)

    // Records Routing
    app.route('/bolaonfl/records/update/:week?')
        .get(rankingController.updateWeeklyRecords)
    app.route('/bolaonfl/records/')
        .post(rankingController.listRecords)

    app.use(function (req, res) {
        res.sendStatus(404);
    });
};