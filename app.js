const path = require('path');
const _ = require('lodash');
const editJsonFile = require("edit-json-file");
const fs = require('fs');

const io = require('./lib/io');
const backup = require('./lib/backup');

const configPath = path.join(__dirname, 'config.json');
const dumpPath = path.join(__dirname, 'dumps');
const fileHandler = editJsonFile(configPath, { autosave: true });
const config = fileHandler.get();

// ==============================================================
// CONFIG FILE
// ==============================================================

// add the default properties
if (!config.path) { fileHandler.set('path', dumpPath); }
if (!config.dbs) { fileHandler.set('dbs', []); }

// save the default properties.
fileHandler
.save((error) => {
  if (error) {
    console.log('Error in the initialization.');
  }
});

// ==============================================================
// IO EVENTS
// ==============================================================

// ============
// PATH COMMAND
// ============
io.on('path', (args) => {
  if (_.isString(args.path)) {
    fileHandler.set('path', args.path);
    fileHandler.save((error) => {
      if (error) {
        return console.log('Error on try to update Path:', error);
      }
    });
  }
});

// ============
// LIST COMMAND
// ============
io.on('list', (args) => {
  backup.list(dumpPath, args.db);
});

// ===========
// DBS COMMAND
// ===========
io.on('dbs', (args) => {
  const dbs = fileHandler.get().dbs || [];
  
  console.log('=====================');
  console.log('Databases:', dbs.length);
  console.log('=====================');
  
  dbs.forEach(db => console.log(db));
});

// ===========
// ADD COMMAND
// ===========
io.on('add', (args) => {
  if (!args.db || args.db === 'all') {
    return console.log('[ERROR] Miss param: "--db=<database_name>" type "-h" to show the help.');
  }

  let dbs = fileHandler.get().dbs || [];
  if (dbs.indexOf(args.db) >= 0) { return; }
  
  dbs.push(args.db);

  fileHandler.set('dbs', dbs);
  fileHandler.save((error) => {
    if (error) {
      return console.log('Error on try to add Database:', error);
    }
  });
});

// ==============
// REMOVE COMMAND
// ==============
io.on('remove', (args) => {
  if (!args.db || args.db === 'all') {
    return console.log('[ERROR] Miss param: "--db=<database_name>" type "-h" to show the help.');
  }

  const dbs = fileHandler.get().dbs || [];
  const index = dbs.indexOf(args.db);

  if (index < 0) { return; }

  dbs.splice(index, 1);

  fileHandler.set('dbs', dbs);
  fileHandler.save((error) => {
    if (error) {
      return console.log('Error on try to add Database:', error);
    }
  });
});

// ============
// DUMP COMMAND
// ============
io.on('dump', (args) => {
  if (args.db !== 'all') {
    backup.dump(dumpPath, args.db);
    return;
  }
  
  const dbs = fileHandler.get().dbs || [];
  dbs.forEach(db => backup.dump(dumpPath, db));
});

// ===============
// RESTORE COMMAND
// ===============
io.on('restore', (args) => {
  if (args.db !== 'all') {
    backup.restore(dumpPath, args.db, args.date);
    return;
  }
  
  const dbs = fileHandler.get().dbs || [];
  dbs.forEach(db => backup.restore(dumpPath, db, args.date));
});

// ===============
// EXAMPLE COMMAND
// ===============
io.on('example', (args) => {
  console.log(`
  =======================================
  Usage Examples
  =======================================

  1) Change path: $ --path="/tmp/backups/"
  2) Add a database: $ --add=my_database
  3) Remove Database: $ --remove=my_database
  4) Show all databases: $ --dbs
  5) Dump all databases: $ --dump
  6) Dump a specific database: $ --dump --db=my_database
  7) List all existing backups: $ --list
  8) List all backups from a specific db: $ --list --db=my_database
  9) Restore all databases usigin the last backup file: $ --restore
  10) Restore a specific database using the last backup file: $ --restore --db=my_database
  11) Restore a specific database using a specific backup file: $ --restore --db=my_database --date=2018-01-01
  11) Restore all databases using a specific date: $ --restore --date=2018-01-01
  `);
});
