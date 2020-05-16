module.exports = function (projectPath, Widget) {
  const widget = new Widget('narradores', __dirname);

  widget.viewMiddleware = function(w, req, res, next) {
    req.we.db.models.user.findAll({
      where: {
        haveAvatar: true,
        active: true,
        roles: {
          [req.we.Op.like]: '%team_member%'
        }
      },
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