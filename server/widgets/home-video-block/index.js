module.exports = function (projectPath, Widget) {
  const widget = new Widget('home-video-block', __dirname);

  widget.beforeSave = function (req, res, next) {
    req.body.configuration = {
      text: req.body.text,
      linkUrl: req.body.linkUrl,
      linkText: req.body.linkText,
      urlVideo: req.body.urlVideo
    };

    return next();
  };

  return widget;
};