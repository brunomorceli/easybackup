# easybackup
A easy way to backup/restore multiple MongoDB databases using CLI.

# How to use
- Install using `npm install easybackup -g`
- Test using `easybackup --example`. That will show the most common examples.

# Main Commands
- `--help` - Show all available options.
- `--example` - Show the most common usage examples.
- `--path=<abs_path>` - Change the dump path.
- `--add` - Add a new Database.
- `-remove`- Remove a specific database.
- `--dbs` - List all available databases. 
- `--list` - List all available backup files.
- `--dump` - Dump all available databases.

#Specification commands
Specification commands are used to complement the Main commands.
- `--db=<database_name>` - Select a specific database.
- `--date=<some_date>` - Specifies a date with format "0000-00-00".

# Author
Bruno Morceli - pirofagista@gmail.com
