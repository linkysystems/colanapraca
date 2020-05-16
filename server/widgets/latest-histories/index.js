module.exports = function (projectPath, Widget) {
  let widget = new Widget('latest-histories', __dirname);

  widget.viewMiddleware = function(w, req, res, next) {
    req.we.db.models.history.findAll({
      where: {
        haveImage: true,
        published: true
      },
      order: [['publishedAt', 'DESC']],
      limit: 9
    })
    .then( (r)=> {
      w.records = r;

      w.recordsC = [];
      w.recordsC[0] = [r[0], r[1], r[2]];
      w.recordsC[1] = [r[3], r[4], r[5]];
      w.recordsC[2] = [r[6], r[7], r[8]];

      next();
      return null;
    })
    .catch(next)
  }

  return widget;
};