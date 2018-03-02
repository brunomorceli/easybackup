'use strict';

/**
 * Make a timestamp using a date object.
 * @param {Object} dateObj Date object.
 * @return {String} Output using the second format: "YYYY-MM-DD" (e.g.: "2018-01-01").
 */
function getTimestamp(dateObj) {
  let now = dateObj || new Date();
  let dd = now.getDate();
  let mm = now.getMonth() + 1;
  let yyyy = now.getFullYear();

  if (dd < 10) { dd = '0' + dd; } 
  if (mm < 10) { mm = '0' + mm; }

  return yyyy + '-' + mm + '-' + dd;
}

/**
 * Transform a timestamp extracted from a backup file into number
 * (e.g.: "2017-01-01" to 20170101)
 * @param {String} filename File name using the timestamp.
 * @return {Number} Positive number greater than 0 if is valid, otherwise 0.
 */
function getDateNumber(filename) {
  if (!filename || filename.length < 10 || filename.indexOf('@') < 0) {
    return null;
  }

  const number = filename
  .split('@')[0]
  .replace(new RegExp('-', 'g'), '');

  return isNaN(number) ? null : number;
}

/**
 * Extracts the date from backup file name.
 * @param {String} filename Backup file name.
 * @returns {String} Result if is a valid file and otherwise null.
 */
function getDateText(filename) {
  const parts = filename.split('@');
  return parts.length > 1 ? parts[0] : null;
}

/**
 * Get the most recent backup based on their timestamp.
 * @param {String} filename1 First file name to be compared.
 * @param {String} filename2 Second file name to be compared.
 * @returns {Boolean} Operation result.
 */
function getMostRecent(filename1, filename2) {
  const date1 = getDateNumber(filename1);
  const date2 = getDateNumber(filename2);

  return date1 >= date2 ? filename1 : filename2;
}

module.exports = {
  getTimestamp: getTimestamp,
  getDateNumber: getDateNumber,
  getDateText: getDateText,
  getMostRecent: getMostRecent,
};