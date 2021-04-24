let maxPointsPerBet = {};

const regularSeasonMaxPoints = (season, week) => {
    if (season >= 1 && season <= 8) {
        if (week >= 1 && week <= 17) {
            return 10;
        }

        if (week === 18 || week === 19) {
            return 20;
        }

        if (week === 20) {
            return 40;
        }

        if (week === 21) {
            return 80;
        }
    }

    if (season >= 9) {
        if (week >= 1 && week <= 18) {
            return 10;
        }
        if (week === 19 || week === 20) {
            return 20;
        }

        if (week === 21) {
            return 40;
        }

        if (week === 22) {
            return 40;
        }
    }
}

maxPointsPerBet.RegularSeason = regularSeasonMaxPoints;

module.exports = maxPointsPerBet;