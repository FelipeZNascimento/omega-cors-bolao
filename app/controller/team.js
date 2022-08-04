const Team = require("../model/team.js");
const CACHE_KEYS = require("../const/cacheValues");
const cachedInfo = require("../utilities/cache");

exports.fetchFromESPNApi = async function () {
  try {
    const allQueries = [Team.fetchESPNApi(), Team.getAll()];
    const allResults = await Promise.allSettled(allQueries);
    const errors = allResults
      .filter((p) => p.status === "rejected")
      .map((p) => p.reason);

    let teamsFromESPN = null;
    if (errors.length === 1 && allResults[0].status === "rejected") {
      teamsFromESPN = null;
    } else if (errors.length > 0) {
      const errorMessage = errors.map((error) => error);
      throw new Error(errorMessage);
    } else {
      teamsFromESPN = JSON.parse(allResults[0].value);
    }

    const teamsRaw = allResults[1].value;
    const teams = Team.mergeWithEspn(teamsRaw, teamsFromESPN);
    const teamsByConferenceAndDivision = Team.byConferenceAndDivision(teams);

    cachedInfo.set(
      CACHE_KEYS.TEAMS,
      teams,
      43200 // 12h
    );
    cachedInfo.set(
      CACHE_KEYS.TEAMS_BY_CONFERENCE_AND_DIVISION,
      teamsByConferenceAndDivision,
      43200 // 12h
    );

    return { teams, teamsByConferenceAndDivision };
  } catch (err) {
    console.log(err);
    throw new Error(err.message);
  }
};

exports.listAll = async function (req, res) {
  if (req.session.user) {
    User.updateLastOnlineTime(req.session.user.id);
  }

  try {
    await Team.getAll().then((teams) => {
      const teamsByConferenceAndDivision = Team.byConferenceAndDivision(teams);

      const dataObject = {
        teamsByConferenceAndDivision: teamsByConferenceAndDivision,
        teams: teams,
      };

      res.send(dataObject);
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};
