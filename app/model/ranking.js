var sql = require('../../sql/sql');

var Ranking = function (ranking) {
    this.ranking = ranking.ranking;
};

const BULLSEYE = 10;

const returnPoints = (match, bet) => {
    if (match.away_points - match.home_points > 0) { //away team won
        if (match.away_points - match.home_points > 7) {//away team won by more than 7 points (easy win)
            if (bet.id_bet === 0) {
                return BULLSEYE;
            } else if (bet.id_bet === 1) {
                return (BULLSEYE/2);
            } else {
                return 0;
            }
        } else { // hard win
            if (bet.id_bet === 0) {
                return (BULLSEYE/2);
            } else if (bet.id_bet === 1) {
                return BULLSEYE;
            } else {
                return 0;
            }
        }
    } else if (match.home_points - match.away_points > 0) {
        if (match.home_points - match.away_points > 7) {
            if (bet.id_bet === 3) {
                return BULLSEYE;
            } else if (bet.id_bet === 2) {
                return (BULLSEYE/2);
            } else {
                return 0;
            }
        } else {
            if (bet.id_bet === 3) {
                return (BULLSEYE/2);
            } else if (bet.id_bet === 2) {
                return (BULLSEYE);
            } else {
                return 0;
            }
        }
    } else {
        if (bet.id_bet === 1 || bet.id_bet === 2) {
            return (BULLSEYE/2);
        }
    }

    return 0;
};

Ranking.bySeason = function(season, result) {
    
}