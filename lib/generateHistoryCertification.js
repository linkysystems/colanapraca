/**
 * Generate history certification
 *
 * @param  {Object}   we
 * @param  {Object}   history
 * @param  {Function} done      Callback
 */
  module.exports = function generateHistoryCertification(ctx, done) {
    const we = ctx.we,
      // moment = we.utils.moment,
      history = ctx.history;

    if (
      !history ||
      !history.creator ||
      !history.creator.id
    ) {
      return done();
    }

    let tpl,
      cert,
      identifier = 'history-published';

    we.utils.async.series([
      function loadCertificationTemplate(done) {
        we.db.models['certification-template']
        .findOne({
          where: { identifier: identifier }
        })
        .then(function (r) {
          // console.log('TPL>', r);
          tpl = r;
          done();
          return null;
        })
        .catch((err)=> {
          we.log.error('generateHistoryCertification:err:', err);
          done(err);
        });
      },
      function loadCFR(done) {
        if (!tpl) return done();

        const uName = history.creator.fullName || history.creator.displayName;
        // const dp = moment(history.publishedAt).format('DD/MM/YYYY');

        let text = uName+' participou de SAÚDE É MEU LUGAR - Mostra de Vivências nos Territórios, '+
        'na edição online, permanentemente acessível no '+
        'endereço www.saudeemeulugar.com, com o relato \''+ history.title+'\'.';

        const cid = 'history-'+history.id+'-published';

         we.db.models.certification.findOrCreate({
          where: {
            identifier: cid
          },
          defaults: {
            name: 'História publicada',
            text: text,
            identifier: cid,
            userId: history.creator.id,
            templateId: tpl.id
          }
        })
        .spread((c, created)=> {
          if (created) {
            we.log.info('history:certification:created:historyId:'+history.id);
          } else {
            we.log.info('history:certification:exists:historyId:'+history.id);
          }

          cert = c;

          done();
          return null;
        })
        .catch(done);
      }
    ], function (err) {
      if (err) {
        we.log.error('Error in generate user history certification: ', err);
      }
      return done(null, cert);
    });
  }