module.exports = function (projectPath, Widget) {
  let widget = new Widget('latest-histories', __dirname);

  widget.beforeSave = function (req, res, next) {
    req.body.configuration = {
      hashtag: req.body.hashtag
    };

    return next();
  };

  widget.viewMiddleware = function(w, req, res, next) {
    req.we.db.models.history.findAll({
      where: {
        haveImage: true,
        published: true
      },
      order: [['publishedAt', 'DESC']],
      limit: 8
    })
    .then( (r)=> {
      w.records = r;
      return next();
    })
    .catch(next)
  }

  return widget;
};