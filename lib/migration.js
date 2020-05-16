const mysql2 = require('mysql2');

module.exports = {
  getConnection(we, cb) {
    if (!we.config.migrationV1) {
      return cb('migrationV1.config.not.found');
    }

    cb(null, mysql2.createConnection(we.config.migrationV1));
  }
}