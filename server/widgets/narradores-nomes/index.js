module.exports = function (projectPath, Widget) {
  const widget = new Widget('narradores', __dirname);

  widget.viewMiddleware = function(w, req, res, next) {
    req.we.db.models.contributor.findAll({
      order: [req.we.db.Sequelize.fn('RAND')]
    })
    .then( (r)=> {
      w.records = r;

      if (!r || !r.length) {
        w.hide = true;
      }

      next();
      return null;
    })
    .catch(next)
  }

  return widget;
};