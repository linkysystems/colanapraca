try {
  module.exports = require('./log-local.js');
} catch(e) {
  module.exports.log = {
    level: process.env.LOG_LV || 'info' ,
    colorize: false,
    timestamp: true,
    json: true,
    stringify: true,
    prettyPrint: false,
    depth: 5,
    showLevel: true
  };
}


