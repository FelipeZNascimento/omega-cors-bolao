const { promisify } = require("util");
var sql = require("../../sql/sql");

// node native promisify
const asyncQuery = promisify(sql.query).bind(sql);

var Season = function (season) {
  this.season = season.season;
  this.id = season.id;
  this.description = season.description;
};

Season.getInfo = async function (season) {
  const rows = asyncQuery(
    `SELECT SQL_NO_CACHE seasons.id, seasons.description FROM seasons
        WHERE seasons.id = ?`,
    [season]
  );

  return rows;
};

Season.getStartTimestamp = async function (season) {
  const rows = asyncQuery(
    `SELECT SQL_NO_CACHE timestamp FROM matches
        WHERE id_season = ?
        ORDER BY timestamp
        LIMIT 1`,
    [season]
  );

  return rows;
};

module.exports = Season;
