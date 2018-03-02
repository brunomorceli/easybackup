'use strict';

const path = require('path');
const events = require('events');
const commander = require('commander');

const eventEmitter = new events.EventEmitter();

// set the commander
commander
.option('--list', 'List all backups from a specific database or all.')
.option('--dbs', 'List the list of databases to handle.')
.option('--dump', 'Dump a database. ')
.option('--restore', 'Restore a specific database.')
.option('--path [abspath]', 'Set the absolute path to restore/dump')
.option('--add', 'Add a new database. Additional param: "--db=<db_name>".')
.option('--remove', 'Remove an existing database. Additional param: "--db=<db_name>"')
.option('--date [date]', 'Date to restore. Allowed inputs: <db_name>, "last".', 'last')
.option('--db [db_name]', 'Database selected. Allowed inputs: <db_name>, "all".', 'all')
.option('--example', 'Show some usage examples.')
.parse(process.argv);

setImmediate(() => {
  eventEmitter.emit('ready');

  if (commander.list) { eventEmitter.emit('list', commander); }
  if (commander.dbs) { eventEmitter.emit('dbs', commander); }
  if (commander.path) { eventEmitter.emit('path', commander); }
  if (commander.add) { eventEmitter.emit('add', commander); }
  if (commander.remove) { eventEmitter.emit('remove', commander); }
  if (commander.dump) { eventEmitter.emit('dump', commander); }
  if (commander.restore) { eventEmitter.emit('restore', commander); }
  if (commander.example) { eventEmitter.emit('example', commander); }
});

module.exports = eventEmitter;