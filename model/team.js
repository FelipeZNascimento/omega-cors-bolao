var sql = require("../sql/sql");
const { promisify } = require("util");
const asyncQuery = promisify(sql.query).bind(sql);
const asyncHttps = require("../utilities/https");

var Team = function (team) {
  this.id = team.id;
  this.name = team.name;
  this.alias = team.alias;
  this.conference = team.conference;
  this.division = team.division;
  this.code = team.code;
  this.team = team.team;
};

Team.mergeWithEspn = (teams, espnFetch) => {
  if (!espnFetch) {
    return teams;
  }

  const espnTeams = espnFetch.sports[0].leagues[0].teams;

  if (!espnTeams) {
    return teams;
  }

  const activeEspnTeams = espnTeams.filter((espnTeam) => espnTeam.team.isActive);
  const updatedTeams = teams.map((team) => {
    selectedTeam = activeEspnTeams.filter(
      (espnTeam) => espnTeam.team.abbreviation === team.code
    )[0];

    team.winLosses = selectedTeam.team.record
      ? selectedTeam.team.record.items[0].summary
      : "0-0";

    return team;
  });

  return updatedTeams;
};

Team.byConferenceAndDivision = (teams) => {
  const afc = {
    north: [],
    east: [],
    south: [],
    west: [],
  };

  const nfc = {
    north: [],
    east: [],
    south: [],
    west: [],
  };

  if (teams.length > 0) {
    teams.forEach((team) => {
      if (team.conference.toLowerCase() === "afc") {
        afc[team.division.toLowerCase()].push(team);
      }
      if (team.conference.toLowerCase() === "nfc") {
        nfc[team.division.toLowerCase()].push(team);
      }
    });
  }

  return {
    afc,
    nfc,
  };
};

Team.getAll = async function () {
  return asyncQuery(`SELECT SQL_NO_CACHE * FROM teams`);
};

Team.fetchESPNApi = async function () {
  return asyncHttps(
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams"
  );

  // In the future maybe switch for the below scoreboard
  // https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard
};

module.exports = Team;
