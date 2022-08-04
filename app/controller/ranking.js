const Bets = require("../model/bets.js");
const Ranking = require("../model/ranking.js");
const User = require("../model/user.js");
const Match = require("../model/match.js");

const MaxPointsPerBet = require("../const/maxPointsPerBet");
const EXTRA_BETS_MAPPING = require("../const/extraBetsMapping");
const SEASON_MAPPING = require("../const/seasonMapping");
const BET_VALUES = require("../const/betValues");
const MATCH_STATUS = require("../const/matchStatus");

const returnPoints = (match, betValue, maxPoints) => {
  if (match.awayScore - match.homeScore > 0) {
    // away team won
    if (match.awayScore - match.homeScore > 7) {
      // away team won by more than 7 points (easy win)
      if (betValue === BET_VALUES.AWAY_EASY) {
        return maxPoints;
      } else if (betValue === 1) {
        return maxPoints / 2;
      } else {
        return 0;
      }
    } else {
      // hard win
      if (betValue === BET_VALUES.AWAY_EASY) {
        return maxPoints / 2;
      } else if (betValue === 1) {
        return maxPoints;
      } else {
        return 0;
      }
    }
  } else if (match.homeScore - match.awayScore > 0) {
    // home team won
    if (match.homeScore - match.awayScore > 7) {
      // home team won by more than 7 points (easy win)
      if (betValue === BET_VALUES.HOME_EASY) {
        return maxPoints;
      } else if (betValue === 2) {
        return maxPoints / 2;
      } else {
        return 0;
      }
    } else {
      if (betValue === BET_VALUES.HOME_EASY) {
        return maxPoints / 2;
      } else if (betValue === 2) {
        return maxPoints;
      } else {
        return 0;
      }
    }
  } else {
    if (
      betValue === BET_VALUES.AWAY_HARD ||
      betValue === BET_VALUES.HOME_HARD
    ) {
      return maxPoints / 2;
    }
  }

  return 0;
};
exports.returnPoints = returnPoints;

const calculateUserExtraPoints = (user, extraBets, extraBetsResults) => {
  let extraBetsPoints = 0;
  if (extraBets === null || extraBetsResults === null) {
    return 0;
  }

  const userExtraBets = extraBets.find(
    (extraBet) => extraBet.idUser === user.id
  );
  if (userExtraBets === undefined) {
    return 0;
  }

  const bets = JSON.parse(userExtraBets.json);
  const betsKeys = Object.keys(bets);

  betsKeys.forEach((key) => {
    if (
      parseInt(key) === EXTRA_BETS_MAPPING.AFC_WILDCARD.TYPE ||
      parseInt(key) === EXTRA_BETS_MAPPING.NFC_WILDCARD.TYPE
    ) {
      bets[key].forEach((wcBet) => {
        if (
          extraBetsResults[key].find((wcBetResult) => wcBetResult === wcBet) !==
          undefined
        ) {
          extraBetsPoints += MaxPointsPerBet.Extras(parseInt(key));
        }
      });
    } else if (bets[key] === extraBetsResults[key]) {
      extraBetsPoints += MaxPointsPerBet.Extras(parseInt(key));
    }
  });

  return extraBetsPoints;
};

const calculateUserPoints = (user, matches, bets, totalPossiblePoints) => {
  let totalPoints = 0;
  let totalBullseye = 0;
  let totalWinners = 0;
  let totalBets = 0;
  let totalMatches = matches.length;

  matches.forEach((match) => {
    const maxPointsPerBet = MaxPointsPerBet.Season(
      parseInt(match.season),
      parseInt(match.week)
    );

    const matchBets = bets
      .filter((bet) => bet.matchId === match.id)
      .filter((bet) => bet.userId === user.id);

    let betValue = null;
    if (matchBets.length > 0) {
      betValue = matchBets[0].betValue; // 0, 1, 2, 3 (away hard, away easy, home easy, home hard)
      totalBets++;
    }
    const betPoints = returnPoints(match, betValue, maxPointsPerBet);
    totalPoints += betPoints;

    if (betPoints > 0) {
      totalWinners++;
      if (betPoints === maxPointsPerBet) {
        totalBullseye++;
      }
    }
  });

  const totalPercentage =
    totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0;

  const fiveMinAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  let isOnline = false;
  if (user.timestamp >= fiveMinAgo) {
    isOnline = true;
  }

  return {
    isOnline,
    id: user.id,
    name: user.name,
    icon: user.icon,
    color: user.color,
    totalPoints,
    totalBullseye,
    totalWinners,
    totalBets,
    totalMatches,
    totalPercentage: totalPercentage.toFixed(1),
  };
};

const buildUsersObject = (
  users,
  matches,
  bets,
  isSeasonRanking,
  additionalInfo
) => {
  const usersObject = users
    .map((user) => {
      if (isSeasonRanking) {
        const totalExtras = calculateUserExtraPoints(
          user,
          additionalInfo.extraBets,
          additionalInfo.extraBetsResults
        );
        const userObject = calculateUserPoints(
          user,
          matches,
          bets,
          additionalInfo.totalPossiblePoints
        );

        userObject.totalPoints += totalExtras;
        userObject.totalExtras = totalExtras;

        return userObject;
      } else {
        return calculateUserPoints(
          user,
          matches,
          bets,
          additionalInfo.totalPossiblePoints
        );
      }
    })
    .sort(
      (a, b) =>
        b.totalPoints - a.totalPoints ||
        b.totalBullseye - a.totalBullseye ||
        a.name.localeCompare(b.name)
    );

  let position = 1;
  usersObject.forEach((user, index) => {
    if (index === 0) {
      user.position = position;
    } else {
      if (
        user.totalPoints === usersObject[index - 1].totalPoints &&
        user.totalBullseye === usersObject[index - 1].totalBullseye
      ) {
        user.position = usersObject[index - 1].position;
      } else {
        user.position = position;
      }
    }
    position++;
  });

  return usersObject;
};
exports.buildUsersObject = buildUsersObject;

exports.listRecords = async function (req, res) {
  let { accumulated, limit, sortAsc, season, week, userId } = req.body;

  try {
    let normalizedSeason = season;
    if (season !== null) {
      normalizedSeason = season > 2000 ? SEASON_MAPPING[season] : season;
    }

    if (accumulated) {
      await Ranking.getCheckpoints(normalizedSeason, week, userId).then(
        (records) => {
          res.send(records);
        }
      );
    } else {
      await Ranking.getRecords(
        sortAsc,
        limit,
        normalizedSeason,
        week,
        userId
      ).then((records) => {
        res.send(records);
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

exports.listBySeasonAndWeek = async function (req, res) {
  const { season, week } = req.params;
  const normalizedSeason = season > 2000 ? SEASON_MAPPING[season] : season;

  try {
    await Match.getBySeasonAndWeek(normalizedSeason, week).then(
      async (matches) => {
        const allQueries = [
          Bets.byMatchIds(matches.map((match) => match.id)),
          User.getBySeason(season),
        ];

        const allResults = await Promise.allSettled(allQueries);
        const errors = allResults
          .filter((p) => p.status === "rejected")
          .map((p) => p.reason);

        if (errors.length > 0) {
          const errorMessage = errors.map((error) => error);
          throw new Error(errorMessage);
        }

        const bets = allResults[0].value;
        const users = allResults[1].value;
        const totalPossiblePoints = matches.reduce(
          (acumulator, match) =>
            acumulator +
            MaxPointsPerBet.Season(parseInt(season), parseInt(match.week)),
          0
        );

        const usersObject = buildUsersObject(users, matches, bets, false, {
          totalPossiblePoints,
        });
        const dataObject = {
          season: season,
          week: week,
          totalPossiblePoints,
          users: usersObject,
        };

        if (req.session.user) {
          User.updateLastOnlineTime(req.session.user.id);
        }

        res.send(dataObject);
      }
    );
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.listBySeason = async function (req, res) {
  const { season } = req.params;
  const normalizedSeason = season > 2000 ? SEASON_MAPPING[season] : season;

  try {
    const allQueries = [
      Match.getBySeason(normalizedSeason),
      User.getBySeason(normalizedSeason),
      Bets.extraBets(normalizedSeason),
      Bets.extraBetsResults(normalizedSeason),
      Match.getNextMatchWeek(),
    ];

    const allResults = await Promise.allSettled(allQueries);
    const errors = allResults
      .filter((p) => p.status === "rejected")
      .map((p) => p.reason);

    if (errors.length > 0) {
      const errorMessage = errors.map((error) => error);
      throw new Error(errorMessage);
    }

    const matches = allResults[0].value;
    const users = allResults[1].value;
    const extraBets = allResults[2].value;
    const extraBetsResults =
      allResults[3].value.length > 0
        ? JSON.parse(allResults[3].value[0].json)
        : null;
    const weekInfo = allResults[4].value[0];
    const weekInfoWeek = weekInfo ? weekInfo.week : 1;

    await Bets.byMatchIds(matches.map((match) => match.id)).then((bets) => {
      const currentWeek = req.session.currentWeek;

      const hasCurrentWeekStarted = matches
        .filter((match) => match.week === currentWeek)
        .find((match) => match.timestamp <= Date.now() / 1000);

      const comparedWeek =
        hasCurrentWeekStarted !== undefined ? currentWeek : currentWeek - 1;

      const pastMatches = matches.filter((match) => match.week < comparedWeek);
      const pastPossiblePoints = pastMatches.reduce(
        (acumulator, match) =>
          acumulator +
          MaxPointsPerBet.Season(
            parseInt(normalizedSeason),
            parseInt(match.week)
          ),
        0
      );
      const previousWeekPositions = buildUsersObject(
        users,
        pastMatches,
        bets,
        true,
        { extraBets, extraBetsResults, pastPossiblePoints }
      ).map((userObject) => {
        return {
          id: userObject.id,
          position: userObject.position,
        };
      });

      const totalPossiblePoints = matches
        .filter((match) => match.week <= weekInfoWeek)
        .reduce(
          (acumulator, match) =>
            acumulator +
            MaxPointsPerBet.Season(
              parseInt(normalizedSeason),
              parseInt(match.week)
            ),
          0
        );

      const usersObject = buildUsersObject(users, matches, bets, true, {
        extraBets,
        extraBetsResults,
        totalPossiblePoints,
      }).map((userObject) => {
        const previousPosition = previousWeekPositions.find(
          (userPosition) => userPosition.id === userObject.id
        );
        return {
          ...userObject,
          previousPosition: previousPosition ? previousPosition.position : null,
        };
      });

      const dataObject = {
        season: normalizedSeason,
        totalPossiblePoints,
        users: usersObject,
        comparedWeek,
      };

      res.send(dataObject);
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

exports.updateWeeklyRecords = async function (req, res) {
  const currentSeason = process.env.SEASON;
  const { week } = req.params;

  try {
    Match.getNextMatchWeek().then(async (result) => {
      const currentWeek = week || result[0].week;
      const allQueries = [
        Match.getBySeasonAndWeek(currentSeason, currentWeek),
        Ranking.getRecords(false, 1, currentSeason, currentWeek),
      ];

      const allResults = await Promise.allSettled(allQueries);
      const errors = allResults
        .filter((p) => p.status === "rejected")
        .map((p) => p.reason);

      if (errors.length > 0) {
        const errorMessage = errors.map((error) => error);
        throw new Error(errorMessage);
      }

      const matches = allResults[0].value;
      const records = allResults[1].value;
      if (
        (records.length === 1 && records[0].pointsAvailable === null) ||
        (records.length === 0 &&
          matches.every(
            (match) =>
              match.status === MATCH_STATUS.FINAL ||
              match.status === MATCH_STATUS.FINAL_OVERTIME
          ))
      ) {
        const rankingQuery = [
          Bets.byMatchIds(matches.map((match) => match.id)),
          User.getBySeason(currentSeason),
        ];

        const rankingResults = await Promise.allSettled(rankingQuery);
        const errors = rankingResults
          .filter((p) => p.status === "rejected")
          .map((p) => p.reason);

        if (errors.length > 0) {
          const errorMessage = errors.map((error) => error);
          throw new Error(errorMessage);
        }

        const bets = rankingResults[0].value;
        const users = rankingResults[1].value;
        const totalPossiblePoints = matches.reduce(
          (acumulator, match) =>
            acumulator +
            MaxPointsPerBet.Season(
              parseInt(currentSeason),
              parseInt(match.week)
            ),
          0
        );

        const usersObject = buildUsersObject(users, matches, bets, false, {
          totalPossiblePoints,
        });
        const pointsPerGame = MaxPointsPerBet.Season(
          currentSeason,
          currentWeek
        );

        const dataObject = usersObject.map((data) => {
          return {
            userId: data.id,
            seasonId: currentSeason,
            week: currentWeek,
            points: data.totalPoints,
            bullseye: data.totalBullseye,
            winners: data.totalWinners,
            percentage: parseFloat(
              data.totalPoints / (data.totalMatches * pointsPerGame)
            ).toFixed(4),
            numOfBets: data.totalBets,
            numOfGames: data.totalMatches,
            pointsPerGame,
          };
        });

        const dataArray = usersObject.map((data) => {
          return [
            data.id,
            currentSeason,
            currentWeek,
            data.totalPoints,
            data.totalBullseye,
            data.totalWinners,
            parseFloat(
              data.totalPoints / (data.totalMatches * pointsPerGame)
            ).toFixed(4),
            data.totalBets,
            data.totalMatches,
            pointsPerGame,
          ];
        });

        Ranking.updateWeekly(dataArray);
        res.send(dataObject);
      } else {
        res.send(records);
      }
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.listRankingHistory = async function (req, res) {
  const { season } = req.params;

  const currentSeason = process.env.SEASON;
  const normalizedSeason = season > 2000 ? SEASON_MAPPING[season] : season;

  try {
    Match.getNextMatchWeek().then(async (result) => {
      const currentWeek = result[0].week;
      const allQueriesCumulative = [];
      const allQueriesWeekly = [];
      let maxWeek = 22;
      if (normalizedSeason === currentSeason) {
        maxWeek = currentWeek;
      }

      for (let i = 1; i <= maxWeek; i++) {
        allQueriesWeekly.push(
          Ranking.getRecords(false, 99999, normalizedSeason, i)
        );
        allQueriesCumulative.push(Ranking.getCheckpoints(normalizedSeason, i));
      }

      const allResultsWeekly = await Promise.allSettled(allQueriesWeekly);
      const allResultsCumulative = await Promise.allSettled(
        allQueriesCumulative
      );
      const errorsWeekly = allResultsWeekly
        .filter((p) => p.status === "rejected")
        .map((p) => p.reason);

      const errorsCumulative = allResultsCumulative
        .filter((p) => p.status === "rejected")
        .map((p) => p.reason);

      if (errorsWeekly.length > 0) {
        const errorMessage = errorsWeekly.map((error) => error);
        throw new Error(errorMessage);
      } else if (errorsCumulative.length > 0) {
        const errorMessage = errorsCumulative.map((error) => error);
        throw new Error(errorMessage);
      }

      const dataObject = {
        season: normalizedSeason,
        weeks: [],
      };

      for (let i = 0; i < maxWeek; i++) {
        const weekObject = {
          week: i + 1,
          accumulated: allResultsCumulative[i].value,
          weekly: allResultsWeekly[i].value,
        };

        dataObject.weeks.push(weekObject);
      }

      res.send(dataObject);
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};
