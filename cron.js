module.exports = function (we, done) {
  we.log.info('Cron run at:', { date: new Date()});
  done();
};