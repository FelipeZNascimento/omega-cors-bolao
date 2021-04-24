var sql = require('../../sql/sql');
var User = require('./user');
const BET_VALUES = require('../const/betValues');

var Ranking = function (ranking) {
    this.ranking = ranking.ranking;
};

Ranking.returnPoints = (match, betValue, maxPoints) => {
    if (match.awayScore - match.homeScore > 0) { //away team won
        if (match.awayScore - match.homeScore > 7) {//away team won by more than 7 points (easy win)
            if (betValue === BET_VALUES.AWAY_EASY) {
                return maxPoints;
            } else if (betValue === 1) {
                return (maxPoints/2);
            } else {
                return 0;
            }
        } else { // hard win
            if (betValue === BET_VALUES.AWAY_EASY) {
                return (maxPoints/2);
            } else if (betValue === 1) {
                return maxPoints;
            } else {
                return 0;
            }
        }
    } else if (match.homeScore - match.awayScore > 0) {
        if (match.homeScore - match.awayScore > 7) {
            if (betValue === BET_VALUES.HOME_EASY) {
                return maxPoints;
            } else if (betValue === 2) {
                return (maxPoints/2);
            } else {
                return 0;
            }
        } else {
            if (betValue === BET_VALUES.HOME_EASY) {
                return (maxPoints/2);
            } else if (betValue === 2) {
                return (maxPoints);
            } else {
                return 0;
            }
        }
    } else {
        if (betValue === BET_VALUES.AWAY_HARD || betValue === BET_VALUES.HOME_HARD) {
            return (maxPoints/2);
        }
    }

    return 0;
};

module.exports = Ranking;
