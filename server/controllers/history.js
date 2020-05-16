const editSteps = {
  1: {
    id: 1,
    label: 'Descrição',
    title: 'Descreva sua história',
    form: 'history1',
  },
  2: {
    id: 2,
    label: 'Texto',
    title: 'Texto',
    form: 'history-text',
  },
  3: {
    id: 3,
    label: 'Imagens',
    title: 'Imagens',
    form: 'history2',
  },
  4: {
    id: 4,
    label: 'Vídeo',
    title: 'Vídeo',
    form: 'history3',
  },
  5: {
    id: 5,
    label: 'Audios',
    title: 'Audios',
    form: 'history4',
  },
  6: {
    id: 6,
    label: 'Publicação',
    title: 'Publicação',
    form: 'history5',
  }
};

module.exports = {
  /**
   * Default find action
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  find(req, res) {
    const we = req.we,
      models = we.db.models,
      Op = we.Op,
      sLiteral = we.db.defaultConnection.literal;

    let query = {
      include: [
        { as: 'creator', model: models.user, attributes: ['id'] }
      ]
    };

    let s = models.history.buildSearchQuery(req, res);

    we.db.defaultConnection.query(s.toString())
    .then( (results)=> {

      if (!results[0].length) {
        return {
          count: 0,
          rows: []
        }
      }

      let countQ  = s.toString()
        .replace('DISTINCT h.id', 'COUNT("h.id") AS count ')
        .split('LIMIT')[0];

      return we.db.defaultConnection.query(countQ)
      .then( (results2)=> { // count query
        return {
          count: results2[0][0].count
        };
      })
      .then( (r)=> { // fetch records query
        let ids = results[0].map((r)=> {
          return r.id;
        });

        query.where = { id: { [Op.in]: ids } };
        query.order = [
           sLiteral('FIELD(history.id,'+ids.join(',')+')')
        ];

        return res.locals.Model
        .findAll(query)
        .then( (records)=> {
          return {
            rows: records,
            count: r.count
          };
        });
      });
    })
    .then(function (result) {
      let creatorsIds = result.rows.map( (r)=> {
        if (!r.creator || !r.creator.id) return;
        return r.creator.id;
      });

      return models.user
      .findAll({
        where: { id: creatorsIds }
      })
      .then( (creators)=> {
        const cOjb = {};

        creators.forEach( (c)=> {
          if (!cOjb[c.id]) {
            cOjb[c.id] = c;
          }
        });

        result.rows.forEach( (r)=> {
          if (!r.creator || !r.creator.id) return;
          r.creator = cOjb[ r.creator.id ];
        });

        return result;
      });
    })
    .then(function completeCount(r) {
      return models.history.count()
      .then((c)=> {
        res.locals.metadata.completeCount = c;
        return r;
      });
    })
    .then(function afterFindAndCount (record) {
      res.locals.metadata.count = record.count;
      res.locals.data = record.rows;

      return models.history.loadSearchTerms()
      .then( (terms)=> {
        res.locals.searchTerms = terms;
        res.ok();
        return null;
      });
    })
    .catch(res.queryError);
  },

  /**
   * Default count action
   *
   * Built for only send count as JSON
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  count(req, res) {
    return res.locals.Model
    .count(res.locals.query)
    .then( (count)=> {
      res.status(200).send({ count: count });
      return null;
    })
    .catch(res.queryError);
  },
  /**
   * Default findOne action
   *
   * Record is preloaded in context loader by default and is avaible as res.locals.data
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  findOne(req, res, next) {
    if (!res.locals.data) {
      return next();
    }

    if (
      !res.locals.data.published &&
      !req.we.acl.canStatic('access_history_unpublished', req.userRoleNames)
    ) {
      return res.forbidden();
    }

    const models = req.we.db.models;

    if (
      res.locals.data.publishAsAnonymous &&
      !req.we.acl.canStatic('access_history_unpublished', req.userRoleNames)
    ) {
      res.locals.data.creator = null;
      res.locals.data.creatorId = null;
      return res.ok();
    }

    if (!res.locals.data.creator) {
      return res.ok();
    }

    models.user
    .findById(res.locals.data.creator.id)
    .then( (creator)=> {
      res.locals.data.creator = creator;
      return res.ok();
    })
    .catch(res.queryError);
  },
  /**
   * Create and create page actions
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  create(req, res) {
    if (!req.isAuthenticated()) {
      return res.goTo('/login?redirectUrl=/history/create');
    }

    const we = req.we;

    if (!res.locals.template) {
      res.locals.template = res.locals.model + '/' + 'create';
    }

    if (!res.locals.data) {
      res.locals.data = {};
    }

    res.locals.steps = editSteps;

    if (req.method === 'POST') {
      if (req.isAuthenticated && req.isAuthenticated()) {
        req.body.creatorId = req.user.id;
      }

      we.utils._.merge(res.locals.data, req.body);

      return res.locals.Model
      .create(req.body)
      .then(function afterCreate (record) {
        res.locals.data = record;

        if (req.user) {
          we.db.models.user.sendNewHistoryEmail(req.user, record);
        }

        if (req.body.avancar || req.body.next) {
          return res.goTo('/history/'+record.id+'/edit?step=2');
        }

        return res.created();
      })
      .catch(res.queryError);
    } else {
      res.ok();
    }
  },
  /**
   * Edit, edit page and update action
   *
   * Record is preloaded in context loader by default and is avaible as res.locals.data
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  edit(req, res) {
    const we = req.we;
    if (!res.locals.template) {
      res.locals.template = res.local.model + '/' + 'edit';
    }

    let record = res.locals.data;

    res.locals.steps = editSteps;

    if (req.query.step && editSteps[req.query.step]) {
      res.locals.stepId = req.query.step;
    } else {
      res.locals.stepId = 1;
    }

    if (
      req.body.creatorId &&
      !req.we.acl.canStatic('update_history_creator', req.userRoleNames)
    ) {
      delete req.body.creatorId;
    }

    res.locals['step'+res.locals.stepId] = true;
    res.locals.currentStep = res.locals.stepId;
    res.locals.currentStepOBJ = editSteps[res.locals.stepId];

    if (we.config.updateMethods.indexOf(req.method) >-1) {
      if (!record) {
        return res.notFound();
      }
      return editResponse(req, res, record);
    } else {
      res.ok();
    }
  },
  /**
   * Publish one history
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  publish(req, res) {
    if (!req.isAuthenticated()) return res.forbidden();

    if (req.body.published === 'false') req.body.published = false;

    const models = req.we.db.models;

    models.history.findById(req.params.id, {
      include: [{ as: 'creator', model: models.user }]
    })
    .then( (history)=> {
      if (!history) return res.notFound();

      return history.publish( Boolean(req.body.published) )
      .then( ()=> {

        if (Boolean(req.body.published)) {
          if (history.creator) {
            models.user.sendNewHistoryEmail(history.creator, history);
          }
        }

        // success
        return res.ok();
      });
    })
    .catch(res.queryError);
  },
  /**
   * Delete and delete action
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  delete(req, res) {
    if (!res.locals.template) {
      res.locals.template = res.local.model + '/' + 'delete';
    }

    let record = res.locals.data;

    if (!record) {
      return res.notFound();
    }

    res.locals.deleteMsg = res.locals.model + '.delete.confirm.msg';

    if (req.method === 'POST' || req.method === 'DELETE') {
      record
      .destroy()
      .then(function afterDestroy () {
        res.locals.deleted = true;
        res.deleted();
        return null;
      })
      .catch(res.queryError);
    } else {
      res.ok();
    }
  }
};

function editResponse(req, res, record) {
  // only update published at publish action:
  delete req.body.published;

  record.updateAttributes(req.body)
  .then(function reloadAssocs(n) {
    return n.reload()
    .then(function() {
      return n;
    });
  })
  .then(function afterUpdate () {
    let nextStep = 1;

    if (!req.accepts('html')) {
      // not html response
      return res.ok();
    }

    if (req.body.next) nextStep = Number(res.locals.currentStep)+1;
    if (req.body.previus) nextStep = Number(res.locals.currentStep)-1;

    if (req.body.saveAndView) {
      return res.goTo('/history/'+record.id);
    } else if (editSteps[nextStep]) {
      return res.goTo('/history/'+record.id+'/edit?step='+ nextStep);
    }
  })
  .catch(res.queryError);
}