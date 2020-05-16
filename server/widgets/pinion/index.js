module.exports = function (projectPath, Widget) {
  const widget = new Widget('pinion', __dirname);

  widget.beforeSave = function(req, res, next) {
    if (!req.body.configuration) {
      req.body.configuration = {};
    }

    req.body.configuration.message = req.body.message;
    req.body.configuration.link = req.body.link;

    return next();
  };

  // // form middleware, use for get data for widget form
  // widget.formMiddleware = function formMiddleware(req, res, next) {
  //
  //   next();
  // }
  //
  return widget;

};