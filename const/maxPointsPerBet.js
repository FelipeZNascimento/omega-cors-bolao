const EXTRA_BETS_MAPPING = require("./extraBetsMapping");

let maxPointsPerBet = {};

const seasonMaxPoints = (season, week) => {
  if (season >= 1 && season <= 8) {
    if (week >= 0 && week <= 17) {
      return 10;
    } else if (week === 18 || week === 19) {
      return 20;
    } else if (week === 20) {
      return 40;
    } else if (week === 21) {
      return 80;
    }
  } else if (season >= 9) {
    if (week >= 0 && week <= 18) {
      return 10;
    } else if (week === 19 || week === 20) {
      return 20;
    } else if (week === 21) {
      return 40;
    } else if (week === 22) {
      return 80;
    }
  }
};

const extraPointsMapping = (extraType) => {
  if (extraType === EXTRA_BETS_MAPPING.SUPERBOWL.TYPE) {
    return EXTRA_BETS_MAPPING.SUPERBOWL.POINTS;
  }

  if (
    extraType === EXTRA_BETS_MAPPING.AFC_CHAMPION.TYPE ||
    extraType === EXTRA_BETS_MAPPING.NFC_CHAMPION.TYPE
  ) {
    return EXTRA_BETS_MAPPING.AFC_CHAMPION.POINTS;
  }

  if (
    extraType === EXTRA_BETS_MAPPING.AFC_NORTH.TYPE ||
    extraType === EXTRA_BETS_MAPPING.AFC_SOUTH.TYPE ||
    extraType === EXTRA_BETS_MAPPING.AFC_EAST.TYPE ||
    extraType === EXTRA_BETS_MAPPING.AFC_WEST.TYPE ||
    extraType === EXTRA_BETS_MAPPING.NFC_NORTH.TYPE ||
    extraType === EXTRA_BETS_MAPPING.NFC_SOUTH.TYPE ||
    extraType === EXTRA_BETS_MAPPING.NFC_EAST.TYPE ||
    extraType === EXTRA_BETS_MAPPING.NFC_WEST.TYPE
  ) {
    return EXTRA_BETS_MAPPING.AFC_NORTH.POINTS;
  }

  if (
    extraType === EXTRA_BETS_MAPPING.AFC_WILDCARD.TYPE ||
    extraType === EXTRA_BETS_MAPPING.NFC_WILDCARD.TYPE
  ) {
    return EXTRA_BETS_MAPPING.AFC_WILDCARD.POINTS;
  }
};

maxPointsPerBet.Season = seasonMaxPoints;
maxPointsPerBet.Extras = extraPointsMapping;

module.exports = maxPointsPerBet;
