module.exports = {
 /**
   * Default find action
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   *
   * @api [get] /link
   * description: "Find/query link list"
   * responses:
   *   "200":
   *     description: "Find/query link success"
   *     schema:
   *       type: object
   *       properties:
   *         link:
   *           $ref: "#/definitions/link"
   */
  find(req, res) {
    res.locals.query.order = [
      ['publishedAt', 'DESC'],
      ['id', 'DESC'],
    ];

    return res.locals.Model
    .findAndCountAll(res.locals.query)
    .then(function afterFindAndCount (record) {
      res.locals.metadata.count = record.count;
      res.locals.data = record.rows;
      res.ok();
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
   *
   * @api [get] /link/count
   * description: "Count link"
   * responses:
   *   "200":
   *     description: "Count link success"
   *     schema:
   *       type: object
   *       properties:
   *         count:
   *           type: number
   *           example: 10
   */
  count(req, res) {
    return res.locals.Model
    .count(res.locals.query)
    .then( (count)=> {
      res.status(200).send({ count: count });
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
   *
   * @api [get] /link/{linkId}
   * description: "Find one link by id"
   * responses:
   *   "200":
   *     description: "Find link by id success"
   *     schema:
   *       type: object
   *       properties:
   *         link:
   *           $ref: "#/definitions/link"
   */
  findOne(req, res, next) {
    if (!res.locals.data) {
      return next();
    }
    // by default record is preloaded in context load
    res.ok();
  },
  /**
   * Create and create page actions
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   *
   * @api [post] /link
   * description: "Create one link"
   * responses:
   *   "201":
   *     description: "Create one link"
   *     schema:
   *       type: object
   *       properties:
   *         link:
   *           $ref: "#/definitions/link"
   */
  create(req, res) {
    if (!res.locals.template) {
      res.locals.template = res.locals.model + '/' + 'create';
    }

    if (!res.locals.data) {
      res.locals.data = {};
    }

    if (req.method === 'POST') {
      if (req.isAuthenticated && req.isAuthenticated()) {
        req.body.creatorId = req.user.id;
      }

      req.we.utils._.merge(res.locals.data, req.body);

      return res.locals.Model
      .create(req.body)
      .then(function afterCreate (record) {
        res.locals.data = record;
        res.created();
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
   *
   * @api [put] /link/{linkId}
   * description: "Update one link. By default accepts post, put and update methods"
   * responses:
   *   "200":
   *     description: "Update one by id link success"
   *     schema:
   *       type: object
   *       properties:
   *         link:
   *           $ref: "#/definitions/link"
   */
  edit(req, res) {
    if (!res.locals.template) {
      res.locals.template = res.local.model + '/' + 'edit';
    }

    let record = res.locals.data;

    if (req.we.config.updateMethods.indexOf(req.method) >-1) {
      if (!record) {
        return res.notFound();
      }

      record.update(req.body)
      .then(function reloadAssocs(n) {
        return n.reload()
        .then(function() {
          return n;
        });
      })
      .then(function afterUpdate (newRecord) {
        res.locals.data = newRecord;
        res.updated();
      })
      .catch(res.queryError);
    } else {
      res.ok();
    }
  },
  /**
   * Delete and delete action
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   *
   * @api [delete] /link/{linkId}
   * description: "Delete one link by id"
   * responses:
   *   "204":
   *     description: "Delete one link record by id success"
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
      })
      .catch(res.queryError);
    } else {
      res.ok();
    }
  }
};