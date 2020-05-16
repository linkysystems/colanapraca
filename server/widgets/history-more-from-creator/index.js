module.exports = function (projectPath, Widget) {
  const widget = new Widget('history-more-from-creator', __dirname);

  widget.viewMiddleware = function(w, req, res, next) {
    if (
      !(
        res.locals.controller == 'history' &&
        res.locals.action == 'findOne'
      )
    ) {
      return next();
    }

    if (
      !res.locals.data ||
      !res.locals.data.id ||
      !res.locals.data.creator ||
      !res.locals.data.creator.id
    ) {
      return next();
    }

    w.history = res.locals.data;

    // find related histories:
    req.we.db.models.history.findAll({
      where: {
        creatorId: res.locals.data.creator.id,
        published: true,
        id: { [req.we.Op.ne]: w.history.id }
      },
      order: [req.we.db.Sequelize.fn('RAND')],
      limit: 3
    })
    .then( (r)=> {
      w.records = r;
      next();
      return null;
    })
    .catch(next)
  }

  return widget;
};