'use strict';

const path = require('path');
const cp = require('child_process');
const fs = require('fs');

const utils = require('./utils');

// =====================================================
// PRIVATE METHODS
// =====================================================

/**
 * Get a list of valid backup files.
 * @param {String} dumpPath Path to the backup files.
 * @returns {[String]} Array containing the name of found files.
 */
function _getFiles(dumpPath, db) {
  const files = fs
  .readdirSync(dumpPath)
  .filter(file => file.indexOf('.gz') >= 0);
  
  return db !== 'all' ? files.filter(file => file.indexOf(db) >= 0) : files;
}

/**
 * Get the file size in bytes.
 * @param {String} filepath File path.
 * @returns {Number} Size in bytes.
 */
function _getFileSize(filepath) {
  const stats = fs.statSync(filepath);
  return stats.size;
}

// =====================================================
// PUBLIC METHODS
// =====================================================

/**
 * Show details from all available databases ("list" CLI command).
 * @param {String} dumpPath Path to the backup files.
 * @param {Object} db Database name.
 */
module.exports.list = (dumpPath, db) => {
  const databases = {};
  const files = _getFiles(dumpPath, db);

  files
  .forEach((filename) => {
    if (filename.indexOf('.gz') < 0 || filename.indexOf('@') < 0) { return; }

    const fileSize = (_getFileSize(path.join(dumpPath, filename)) / 1024 / 1024).toFixed(3);
    const dateNumber = utils.getDateNumber(filename);
    const date = utils.getDateText(filename);
    const dbName = filename.split('@')[1].replace('.gz', '');

    if (!databases[dbName]) { databases[dbName] = {}; }

    if (!utils.getMostRecent(dateNumber, databases[dbName].dateNumber)) {
      return;
    }

    databases[dbName] = {
      fileSize: fileSize,
      dateNumber: dateNumber,
      date: date,
    };
  });

  const total = Object.keys(databases).length;
  console.log('=====================================');
  console.log('Databases:', total);
  console.log('=====================================');
  console.log('Path to files:', dumpPath, '\n');
  
  console.log('-------------------------------------');
  if (!total) { console.log('No backup files \n'); }

  for(let key in databases) {
    const db = databases[key];
    const sizeSulfix = db.fileSize < 1 ? 'kb' : 'mb';
    console.log('name:', key, 'date:', db.date, 'size:', db.fileSize, sizeSulfix);
  }
  console.log('-------------------------------------');
}

/**
 * Dump a specific database into a .tar file.
 * @param {String} dumpPath Path to the backup files.
 * @param {Object} db Database name.
 */
module.exports.dump = (dumpPath, db) => {  
  const today = utils.getTimestamp();
  const filename = today + '@' + db + '.gz';
  const filePath = path.join(dumpPath, filename);
  const cmd = `mongodump --db ${db} --gzip --archive="${filePath}"`;

  cp.exec(cmd, (error, stdout, stderr) => {
    if (error) { return console.log('Internal Error:', error); }
    if (stderr) { return console.log('MongoDB Error:', stderr); }

    console.log(`File ${filename} created successfully!`);
  });
};

/**
 * Restore a specific database using the most recent found backup.
 * @param {String} dumpPath Path to the backup files.
 * @param {Object} db Database name.
 * @param {String} date Date to restore. Additional options: ['last'].
 */
module.exports.restore = (dumpPath, db, date) => {
  let chosenFile = null;

  const files = _getFiles(dumpPath, db)
  .filter(file => file.indexOf(db) >= 0);

  if (date === 'last') {
    files.forEach(function(filename) {
      chosenFile = !chosenFile ? filename : utils.getMostRecent(chosenFile, filename);
    });
  }
  else {
    chosenFile = files.find(file => file.indexOf(date) >= 0);
  }

  if (!chosenFile) {
    if (db) { return console.log(`No backup found to "${db}" database`); }
    return console.log('No backup found.');
  }

  const filePath = path.join(dumpPath, chosenFile);
  const cmd = `mongorestore --gzip --archive="${filePath}"`;

  cp.exec(cmd, null, (error, stdout, stderr) => {
    if (error) { return console.log('Internal Error:', error); }
    if (stderr) { return console.log('MongoDB Error:', stderr); }

    console.log(`Dump ${chosenFile} restored successfully!`);
  });
};
